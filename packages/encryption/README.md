# @privaforge/encryption

Zero-knowledge client-side encryption primitives for PrivaForge. **This package
is browser-only in production.** It must never run on a server that handles
plaintext user data.

See [ADR-0002](../../docs/adr/0002-crypto-design.md) for the cryptographic
design and [SECURITY.md](../../SECURITY.md) for the threat model.

## What's inside

| Primitive | Use |
|-----------|-----|
| `deriveMasterKey(passphrase, salt)` | Argon2id → 32-byte master key |
| `deriveVaultKey(master, vaultId, vaultSalt)` | HKDF-SHA-256 → non-extractable AES-256-GCM CryptoKey |
| `encryptString(plaintext, key, ad)` | AES-256-GCM → versioned envelope |
| `decryptString(envelope, key, ad)` | Envelope → plaintext (throws on any tampering) |

## Envelope format

```
[0x01][alg][iv:12][ciphertext||auth-tag]
```

Self-describing, forward-compatible. Version 1 uses alg `0x01` (AES-256-GCM, 128-bit tag).

## Invariants

- Plaintext never leaves this package or the browser.
- Keys are non-extractable where the raw bytes aren't needed.
- IVs are fresh random per message.
- AAD binds ciphertext to `(userId, resourceType, resourceId, version)`.
- Any tampering → `CryptoError` with code `AUTH_FAILED`.

## Running tests

```bash
pnpm --filter @privaforge/encryption test
```

Property-based tests (`tests/properties.test.ts`) assert roundtrip correctness
and one-bit tamper detection over random inputs. All crypto code changes MUST
pass these with `--testTimeout=60000` (Argon2id is intentionally slow).

## Audit status

⚠️ **This package has NOT been externally audited.** A third-party cryptographic
review (per plan §5.3) is a launch-blocking prerequisite. Do not deploy to
production until ADR-0002's "Audit gate" section is satisfied.
