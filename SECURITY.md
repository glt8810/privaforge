# Security

PrivaForge is a zero-knowledge platform. **If the server can read a user's
prompt, that is a bug and a launch-blocker.** This document describes the
threat model, the invariants we enforce, and how to report vulnerabilities.

See [ADR-0002](docs/adr/0002-crypto-design.md) for the cryptographic design.

## Threat model (summary)

| Adversary | In scope? | Mitigation |
|-----------|-----------|------------|
| Network attacker on the wire | Yes | TLS 1.3 everywhere + HSTS preload. All user content is already ciphertext before TLS. |
| Malicious/curious server operator | Yes | Content is encrypted client-side with a key the server never sees. Even with full DB + code access, plaintext is not recoverable. |
| Subpoena / legal compulsion | Yes | We can hand over only ciphertext, salts, and metadata listed below. No backdoor. |
| Compromised service account on third-party (Neon, Vercel, Stripe) | Yes | Blast radius = ciphertext only. Stripe never sees prompt content. |
| XSS / supply-chain compromise of the web app | Partial | Strict CSP, SRI, non-extractable CryptoKeys, Dependabot + CodeQL, `pnpm audit` CI gate. A full runtime-JS compromise still wins — this is the hardest attack to defend against and is why a third-party audit + bug bounty are launch gates. |
| Passphrase brute force | Yes | Argon2id with 128 MiB memory + 3 iterations. Per-user salt. Minimum passphrase length enforced in UI. |
| Physical access to unlocked device | No | User responsibility. We recommend Passkey + device lock. |

## Data classification

Every column or field in the system falls into one of these buckets:

| Class | Examples | Storage rule |
|-------|----------|--------------|
| **Ciphertext** | prompt body, title, notes, document chunks | `bytea` envelope only. No plaintext logging, ever. |
| **Hash** | tag hashes | `text` fixed-length hex. One-way. |
| **User-published public** | marketplace title, description, price | `text` / numeric. The user explicitly chose to publish. |
| **System metadata** | IDs, timestamps, plan tier, stripe_customer_id | Unencrypted. Does not reveal content. |
| **Auth material** | email (for login), password-derived key salt | `text` / `bytea`. Salt is random and non-secret. Password/key itself never stored. |

**Adding a new column?** It MUST fit one of these buckets. If it's user-provided
free text, it's ciphertext. Ambiguity = block the PR.

## Invariants enforced in code

1. `packages/encryption` is the only place AES-GCM / Argon2id are called.
2. `no-console` lint rule in `packages/encryption` (only `warn`/`error` permitted, and even those must never include keys or plaintext).
3. Web Crypto `CryptoKey` objects for vault keys are `extractable: false`.
4. IVs come from `crypto.getRandomValues` — never a deterministic source.
5. AAD binds every ciphertext to `(userId, resourceType, resourceId, version)`.
6. Server routes never call `decryptString`. Any PR introducing such a call must update this list and ADR-0002.
7. Strict Content-Security-Policy in production (see `apps/web/next.config.mjs`).

## Pre-launch gates

These MUST be green before public launch (per plan §5, §11):

- [ ] External cryptographic review (Trail of Bits / NCC Group) — all Critical/High closed.
- [ ] Penetration test — all Critical/High closed.
- [ ] Bug bounty program live on HackerOne, $50k+ pool.
- [ ] SOC 2 Type I evidence collection underway (Type II within 6 months).
- [ ] GDPR DPIA (Data Protection Impact Assessment) completed.
- [ ] Privacy policy + ToS + DPA reviewed by privacy counsel.
- [ ] `pnpm audit --audit-level=high` clean.
- [ ] Lighthouse security + a11y ≥ 95 on all critical pages.

## Reporting a vulnerability

**Do not** open a public GitHub issue.

Email **security@privaforge.ai** with:

- A description of the issue and its impact.
- Steps to reproduce.
- Proof-of-concept if available.

We commit to:
- Acknowledge within 24 hours.
- Fix or mitigate within 30 days for Critical/High.
- Publicly credit the reporter on request.
- Pay a bounty per HackerOne policy (once live).

## Cryptographic constants (pinned)

| Parameter | Value |
|-----------|-------|
| Argon2id memory | 128 MiB |
| Argon2id iterations | 3 |
| Master key length | 256 bits |
| AEAD | AES-256-GCM |
| IV length | 96 bits (random per message) |
| GCM tag length | 128 bits |
| KDF (secondary) | HKDF-SHA-256 |
| Envelope version | 1 (`0x01`) |

Any change to this table requires a new ADR, a re-audit, and a migration plan.
