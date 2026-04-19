import sodium from 'libsodium-wrappers-sumo';

import { CryptoError } from './errors.js';
import { getSubtle, randomBytes } from './platform.js';
import { DEFAULT_ARGON2ID_PARAMS, KEY_LENGTH, SALT_LENGTH, type Argon2idParams } from './types.js';

let sodiumReady: Promise<void> | null = null;

async function ensureSodium(): Promise<typeof sodium> {
  if (sodiumReady === null) {
    sodiumReady = sodium.ready;
  }
  await sodiumReady;
  return sodium;
}

/** Generates a fresh random salt suitable for {@link deriveMasterKey}. */
export function generateSalt(): Uint8Array {
  return randomBytes(SALT_LENGTH);
}

/**
 * Derives a 256-bit master key from a user passphrase using Argon2id.
 *
 * Memory-hard by design (128 MiB default) to resist GPU / ASIC brute-force.
 * The returned key should be held in memory only for as long as needed and
 * then zeroed by dropping references. Do not persist the raw key.
 */
export async function deriveMasterKey(
  passphrase: string,
  salt: Uint8Array,
  params: Argon2idParams = DEFAULT_ARGON2ID_PARAMS,
): Promise<Uint8Array> {
  if (passphrase.length === 0) {
    throw new CryptoError('INVALID_INPUT', 'passphrase must not be empty');
  }
  if (salt.length !== SALT_LENGTH) {
    throw new CryptoError('INVALID_INPUT', `salt must be ${SALT_LENGTH} bytes`);
  }
  const s = await ensureSodium();
  return s.crypto_pwhash(
    KEY_LENGTH,
    passphrase,
    salt,
    params.opsLimit,
    params.memLimitBytes,
    s.crypto_pwhash_ALG_ARGON2ID13,
  );
}

/**
 * Derives a non-extractable AES-256-GCM CryptoKey for a given vault, using
 * HKDF-SHA-256 with a per-vault salt and context-bound `info`.
 *
 * The returned key is non-extractable (`extractable: false`) so the raw bytes
 * cannot be read back by JavaScript — reducing the blast radius of a future
 * XSS or supply-chain compromise.
 */
export async function deriveVaultKey(
  masterKey: Uint8Array,
  vaultId: string,
  vaultSalt: Uint8Array,
): Promise<CryptoKey> {
  if (masterKey.length !== KEY_LENGTH) {
    throw new CryptoError('INVALID_INPUT', `master key must be ${KEY_LENGTH} bytes`);
  }
  if (vaultSalt.length !== SALT_LENGTH) {
    throw new CryptoError('INVALID_INPUT', `vault salt must be ${SALT_LENGTH} bytes`);
  }
  const subtle = getSubtle();
  const baseKey = await subtle.importKey('raw', masterKey, 'HKDF', false, ['deriveKey']);
  const info = new TextEncoder().encode(`privaforge.vault.v1|${vaultId}`);
  return subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: vaultSalt, info },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Imports a raw 32-byte key as an AES-256-GCM CryptoKey. Marked non-extractable.
 * Primarily useful for tests and for unwrapping keys received via sharing.
 */
export async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  if (raw.length !== KEY_LENGTH) {
    throw new CryptoError('INVALID_INPUT', `raw key must be ${KEY_LENGTH} bytes`);
  }
  const subtle = getSubtle();
  return subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}
