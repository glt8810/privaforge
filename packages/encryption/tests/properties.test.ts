import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { decryptString, encryptString } from '../src/aead.js';
import { DecryptErrorCode } from '../src/errors.js';
import { importAesKey } from '../src/kdf.js';
import type { AssociatedData } from '../src/types.js';

const AD: AssociatedData = {
  userId: '11111111-1111-1111-1111-111111111111',
  resourceType: 'prompt',
  resourceId: '22222222-2222-2222-2222-222222222222',
  version: 1,
};

describe('property: encrypt/decrypt roundtrip', () => {
  it('decrypt(encrypt(x, k), k, ad) === x for arbitrary unicode strings', async () => {
    const key = await importAesKey(new Uint8Array(32).fill(0x5a));
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 4096 }), async (plaintext) => {
        const env = await encryptString(plaintext, key, AD);
        const decrypted = await decryptString(env, key, AD);
        expect(decrypted).toBe(plaintext);
      }),
      { numRuns: 50 },
    );
  });

  it('any single-byte mutation of the envelope causes auth failure', async () => {
    const key = await importAesKey(new Uint8Array(32).fill(0x5a));
    const plaintext = 'the quick brown fox jumps over the lazy dog';
    const env = await encryptString(plaintext, key, AD);

    await fc.assert(
      fc.asyncProperty(
        // Mutate any byte at any position except bytes 0 and 1 (version + alg
        // produce a different typed error, not AUTH_FAILED — those are tested
        // separately in envelope.test.ts).
        fc.integer({ min: 2, max: env.length - 1 }),
        fc.integer({ min: 1, max: 255 }),
        async (idx, mask) => {
          const tampered = new Uint8Array(env);
          tampered[idx] = (tampered[idx] ?? 0) ^ mask;
          try {
            await decryptString(tampered, key, AD);
            // If decryption somehow succeeded, the output must not match the
            // original (that would be a confidentiality loss, but here we're
            // asserting integrity).
            return false;
          } catch (e: unknown) {
            return (e as { code?: string }).code === DecryptErrorCode.AuthFailed;
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});
