/**
 * @privaforge/encryption
 *
 * Zero-knowledge client-side encryption primitives. See docs/adr/0002-crypto-design.md.
 *
 * Public contract:
 *   - Argon2id(passphrase, salt)          → masterKey (32 bytes)
 *   - HKDF-SHA-256(masterKey, vaultSalt)  → vaultKey  (AES-256-GCM CryptoKey, non-extractable)
 *   - AES-256-GCM(vaultKey, iv, AAD)      → envelope  (versioned byte array)
 *
 * No server-side code path in this package may ever handle raw passphrases or
 * derived keys. This package is consumed by the browser only.
 */

export { decryptBytes, decryptString, encryptBytes, encryptString } from './aead.js';
export { decodeEnvelope, encodeEnvelope } from './envelope.js';
export { deriveMasterKey, deriveVaultKey, generateSalt, importAesKey } from './kdf.js';
export { CryptoError, DecryptErrorCode } from './errors.js';
export { randomBytes, timingSafeEqual } from './platform.js';
export { serializeAAD } from './aad.js';
export * from './types.js';
