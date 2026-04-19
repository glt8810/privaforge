import { describe, expect, it } from 'vitest';

import { decryptString, encryptString } from '../src/aead.js';
import { CryptoError, DecryptErrorCode } from '../src/errors.js';
import { importAesKey } from '../src/kdf.js';
import { randomBytes } from '../src/platform.js';
import type { AssociatedData } from '../src/types.js';

const AD: AssociatedData = {
  userId: '11111111-1111-1111-1111-111111111111',
  resourceType: 'prompt',
  resourceId: '22222222-2222-2222-2222-222222222222',
  version: 1,
};

async function fixedKey(): Promise<CryptoKey> {
  return importAesKey(new Uint8Array(32).fill(0x11));
}

describe('aead', () => {
  it('roundtrips short plaintext', async () => {
    const key = await fixedKey();
    const env = await encryptString('hello world', key, AD);
    const pt = await decryptString(env, key, AD);
    expect(pt).toBe('hello world');
  });

  it('roundtrips empty string', async () => {
    const key = await fixedKey();
    const env = await encryptString('', key, AD);
    const pt = await decryptString(env, key, AD);
    expect(pt).toBe('');
  });

  it('roundtrips unicode', async () => {
    const key = await fixedKey();
    const plaintext = '🔐 zero-knowledge — Ω 密码学 прямо сейчас';
    const env = await encryptString(plaintext, key, AD);
    const pt = await decryptString(env, key, AD);
    expect(pt).toBe(plaintext);
  });

  it('produces different ciphertexts for the same plaintext (random IV)', async () => {
    const key = await fixedKey();
    const a = await encryptString('same', key, AD);
    const b = await encryptString('same', key, AD);
    expect(a).not.toEqual(b);
  });

  it('fails to decrypt with wrong key', async () => {
    const keyA = await importAesKey(new Uint8Array(32).fill(0xaa));
    const keyB = await importAesKey(new Uint8Array(32).fill(0xbb));
    const env = await encryptString('secret', keyA, AD);
    await expect(decryptString(env, keyB, AD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('fails to decrypt with different AAD (wrong user)', async () => {
    const key = await fixedKey();
    const env = await encryptString('secret', key, AD);
    const otherAD: AssociatedData = { ...AD, userId: '00000000-0000-0000-0000-000000000000' };
    await expect(decryptString(env, key, otherAD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('fails to decrypt with different AAD (wrong resource)', async () => {
    const key = await fixedKey();
    const env = await encryptString('secret', key, AD);
    const otherAD: AssociatedData = { ...AD, resourceId: '99999999-9999-9999-9999-999999999999' };
    await expect(decryptString(env, key, otherAD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('fails to decrypt with different version', async () => {
    const key = await fixedKey();
    const env = await encryptString('secret', key, AD);
    const otherAD: AssociatedData = { ...AD, version: 2 };
    await expect(decryptString(env, key, otherAD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('detects single-bit tampering in ciphertext', async () => {
    const key = await fixedKey();
    const env = await encryptString('tamper me', key, AD);
    // Flip a bit past the envelope header.
    const tampered = new Uint8Array(env);
    const idx = tampered.length - 5;
    tampered[idx] = (tampered[idx] ?? 0) ^ 0x01;
    await expect(decryptString(tampered, key, AD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('detects IV tampering', async () => {
    const key = await fixedKey();
    const env = await encryptString('iv-probe', key, AD);
    const tampered = new Uint8Array(env);
    tampered[3] = (tampered[3] ?? 0) ^ 0x01; // inside the IV (bytes 2..13)
    await expect(decryptString(tampered, key, AD)).rejects.toMatchObject({
      code: DecryptErrorCode.AuthFailed,
    });
  });

  it('rejects AAD fields containing the pipe delimiter', async () => {
    const key = await fixedKey();
    const badAD: AssociatedData = { ...AD, userId: 'a|b' };
    await expect(encryptString('x', key, badAD)).rejects.toBeInstanceOf(Error);
  });
});
