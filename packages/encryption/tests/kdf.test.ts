import { describe, expect, it } from 'vitest';

import { decryptString, encryptString } from '../src/aead.js';
import { CryptoError, DecryptErrorCode } from '../src/errors.js';
import {
  deriveMasterKey,
  deriveVaultKey,
  generateSalt,
  importAesKey,
} from '../src/kdf.js';
import { KEY_LENGTH, SALT_LENGTH, type AssociatedData } from '../src/types.js';

const AD: AssociatedData = {
  userId: '11111111-1111-1111-1111-111111111111',
  resourceType: 'prompt',
  resourceId: '22222222-2222-2222-2222-222222222222',
  version: 1,
};

// Argon2id at full 128 MiB memory is slow; these tests keep default params
// but only derive once where possible. CI should run with `--testTimeout=60000`.

describe('kdf', () => {
  it('deriveMasterKey is deterministic for same inputs', async () => {
    const salt = generateSalt();
    const k1 = await deriveMasterKey('correct horse battery staple', salt, {
      memLimitBytes: 32 * 1024 * 1024,
      opsLimit: 1,
    });
    const k2 = await deriveMasterKey('correct horse battery staple', salt, {
      memLimitBytes: 32 * 1024 * 1024,
      opsLimit: 1,
    });
    expect(k1).toEqual(k2);
    expect(k1.length).toBe(KEY_LENGTH);
  }, 60_000);

  it('deriveMasterKey differs for different salts', async () => {
    const params = { memLimitBytes: 32 * 1024 * 1024, opsLimit: 1 };
    const k1 = await deriveMasterKey('pw', generateSalt(), params);
    const k2 = await deriveMasterKey('pw', generateSalt(), params);
    expect(k1).not.toEqual(k2);
  }, 60_000);

  it('deriveMasterKey rejects empty passphrase', async () => {
    await expect(deriveMasterKey('', generateSalt())).rejects.toBeInstanceOf(CryptoError);
  });

  it('deriveMasterKey rejects salt of wrong length', async () => {
    await expect(deriveMasterKey('pw', new Uint8Array(8))).rejects.toBeInstanceOf(CryptoError);
  });

  it('generateSalt returns a fresh 16-byte value', () => {
    const s1 = generateSalt();
    const s2 = generateSalt();
    expect(s1.length).toBe(SALT_LENGTH);
    expect(s2.length).toBe(SALT_LENGTH);
    expect(s1).not.toEqual(s2);
  });

  it('deriveVaultKey produces keys that decrypt their own ciphertexts', async () => {
    const master = new Uint8Array(KEY_LENGTH).fill(0x7f);
    const vaultSalt = generateSalt();
    const vaultKey = await deriveVaultKey(master, 'vault-A', vaultSalt);
    const env = await encryptString('vault payload', vaultKey, AD);
    const pt = await decryptString(env, vaultKey, AD);
    expect(pt).toBe('vault payload');
  });

  it('different vaultIds yield isolated keys (same master, same salt)', async () => {
    const master = new Uint8Array(KEY_LENGTH).fill(0x55);
    const vaultSalt = generateSalt();
    const kA = await deriveVaultKey(master, 'vault-A', vaultSalt);
    const kB = await deriveVaultKey(master, 'vault-B', vaultSalt);
    const env = await encryptString('A-only', kA, AD);
    await expect(decryptString(env, kB, AD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('different vaultSalts yield isolated keys (same master, same vaultId)', async () => {
    const master = new Uint8Array(KEY_LENGTH).fill(0x33);
    const kA = await deriveVaultKey(master, 'vault', generateSalt());
    const kB = await deriveVaultKey(master, 'vault', generateSalt());
    const env = await encryptString('A-only', kA, AD);
    await expect(decryptString(env, kB, AD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('deriveVaultKey rejects malformed inputs', async () => {
    await expect(
      deriveVaultKey(new Uint8Array(16), 'v', generateSalt()),
    ).rejects.toBeInstanceOf(CryptoError);
    await expect(
      deriveVaultKey(new Uint8Array(KEY_LENGTH), 'v', new Uint8Array(8)),
    ).rejects.toBeInstanceOf(CryptoError);
  });

  it('importAesKey rejects wrong-length input', async () => {
    await expect(importAesKey(new Uint8Array(16))).rejects.toBeInstanceOf(CryptoError);
  });
});
