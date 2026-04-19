# ADR-0002: Cryptographic Design

**Status:** Accepted (pending third-party audit)
**Date:** 2026-04-19
**Deciders:** Tech Lead (Claude)
**Reviewers required before production:** External cryptography auditor (Trail of Bits or NCC Group per plan §5.3)

## Context

The platform promises zero-knowledge: the server cannot read user prompts. This ADR
pins the exact primitives, parameters, and envelope format. Any change requires a
new ADR and a re-audit.

## Primitives

| Operation               | Primitive                                  | Parameters                                                                                      |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Passphrase → Master Key | **Argon2id** (libsodium)                   | memory = 128 MiB, iterations (opsLimit) = 3, parallelism = 1, output = 32 bytes                 |
| Master Key → Vault Key  | **HKDF-SHA-256** (Web Crypto)              | info = `"privaforge.vault.v1\|" + vaultId`, salt = per-vault random 16 bytes, output = 32 bytes |
| Content encryption      | **AES-256-GCM** (Web Crypto)               | 96-bit random IV per message, 128-bit auth tag, AAD binds context                               |
| Sharing (future)        | **X25519 + ChaCha20-Poly1305** (libsodium) | Ephemeral sender key, recipient long-term key                                                   |
| Random                  | `crypto.getRandomValues` (Web Crypto)      | CSPRNG — platform-guaranteed                                                                    |

## Envelope Format v1

All encrypted blobs on the wire and at rest use this self-describing envelope:

```
+-------+--------+----+-----------------------+
| 0x01  | algId  | IV | ciphertext||auth tag  |
+-------+--------+----+-----------------------+
  1 B    1 B      12B   variable + 16 B
```

- Byte 0: format version (`0x01`)
- Byte 1: algorithm id (`0x01` = AES-256-GCM)
- Bytes 2–13: 96-bit IV
- Remainder: AES-GCM ciphertext with appended 128-bit auth tag

**AAD (Additional Authenticated Data)** for each message binds the ciphertext to
its logical slot, preventing swap/replay attacks:

```
AAD = "privaforge.v1" || userId || resourceType || resourceId || version
```

Tampering with AAD (e.g., moving a blob to a different user or prompt) causes
GCM auth failure on decrypt.

## Key Lifecycle

1. **Registration:** client generates random 16-byte salt, runs Argon2id(passphrase, salt) → master key. Server stores salt only.
2. **Login:** client re-derives master key from passphrase + stored salt. Never transmitted.
3. **Vault access:** HKDF(master, info=`"vault.v1|"+vaultId`, salt=vaultSalt) → vault key.
4. **Per-prompt:** vault key encrypts the content with per-message random IV.
5. **Rotation:** `rotateMasterKey(oldPassphrase, newPassphrase)` re-encrypts vault-key wrappers only (not every blob). Vault keys stay stable; master key wraps them.
6. **Recovery:** at registration client generates a 12-word BIP-39 mnemonic, shown once. Mnemonic → alternate master key via the same Argon2id path. User is warned: **lose it and the data is gone.**

## Invariants enforced in code

- `encrypt()` rejects plaintexts > 64 MiB (single-message GCM safety margin).
- `decrypt()` returns `Result<string, DecryptError>` — never throws raw; callers must handle tamper-detection explicitly.
- No logging of plaintext, keys, or passphrases. Enforced by a lint rule forbidding `console.log` in the encryption package.
- IV reuse under the same key is prevented by always sourcing from `crypto.getRandomValues`. A single key can safely encrypt up to ~2^32 messages with random IVs (birthday bound).
- Web Crypto `CryptoKey` objects are marked `extractable: false` wherever the raw bytes are not needed downstream.

## Testing requirements (MUST pass before each release)

1. Roundtrip property test (fast-check): `decrypt(encrypt(x, k), k) === x` for arbitrary `x` of lengths 0..10_000 bytes.
2. Tamper detection: flipping any single bit of ciphertext, IV, or AAD causes decryption to fail.
3. Wrong-key rejection: `decrypt(blob, wrongKey)` fails with `DecryptError.AuthFailed`.
4. Cross-vault isolation: blobs encrypted under vault A fail to decrypt under vault B even with same master key.
5. Argon2id parameter test: output is deterministic for same (passphrase, salt, params).
6. KAT (Known Answer Tests): hardcoded vectors from libsodium and NIST AES-GCM test suite.

## Out of scope (v1)

- **Searchable encryption / blind index.** Deferred to v2.0 (plan §4.2). Full-text search runs client-side after decryption.
- **Post-quantum KEM.** Revisit when NIST PQC suite (ML-KEM) has mature browser libraries.
- **Hardware key attestation.** Passkeys via WebAuthn handle the auth factor; the master key itself is derived from passphrase (knowledge factor). Hardware-backed master keys are a v1.4 enterprise feature.

## Audit gate

This design MUST NOT be changed without:

1. A new ADR documenting the change and its threat-model impact.
2. Sign-off from the external cryptography auditor.
3. A compatibility migration plan for existing encrypted data.
