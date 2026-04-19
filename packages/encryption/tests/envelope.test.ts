import { describe, expect, it } from 'vitest';

import { decodeEnvelope, encodeEnvelope } from '../src/envelope.js';
import { CryptoError, DecryptErrorCode } from '../src/errors.js';
import {
  ALG_AES_256_GCM,
  ENVELOPE_VERSION,
  GCM_TAG_LENGTH,
  IV_LENGTH,
} from '../src/types.js';

describe('envelope', () => {
  const validEnv = {
    version: ENVELOPE_VERSION,
    alg: ALG_AES_256_GCM,
    iv: new Uint8Array(IV_LENGTH).fill(0x42),
    // 32 bytes of body + 16 byte tag = 48 bytes total ciphertext
    ciphertext: new Uint8Array(32 + GCM_TAG_LENGTH).fill(0xab),
  } as const;

  it('roundtrips a valid envelope', () => {
    const bytes = encodeEnvelope(validEnv);
    const decoded = decodeEnvelope(bytes);
    expect(decoded.version).toBe(ENVELOPE_VERSION);
    expect(decoded.alg).toBe(ALG_AES_256_GCM);
    expect(decoded.iv).toEqual(validEnv.iv);
    expect(decoded.ciphertext).toEqual(validEnv.ciphertext);
  });

  it('rejects IV of wrong length', () => {
    expect(() =>
      encodeEnvelope({ ...validEnv, iv: new Uint8Array(11) }),
    ).toThrowError(CryptoError);
  });

  it('rejects ciphertext shorter than auth tag', () => {
    expect(() =>
      encodeEnvelope({ ...validEnv, ciphertext: new Uint8Array(GCM_TAG_LENGTH - 1) }),
    ).toThrowError(CryptoError);
  });

  it('rejects truncated input', () => {
    const bytes = encodeEnvelope(validEnv).slice(0, 10);
    try {
      decodeEnvelope(bytes);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(CryptoError);
      expect((e as CryptoError).code).toBe(DecryptErrorCode.MalformedEnvelope);
    }
  });

  it('rejects unknown version byte', () => {
    const bytes = encodeEnvelope(validEnv);
    bytes[0] = 0x99;
    try {
      decodeEnvelope(bytes);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as CryptoError).code).toBe(DecryptErrorCode.UnsupportedVersion);
    }
  });

  it('rejects unknown algorithm id', () => {
    const bytes = encodeEnvelope(validEnv);
    bytes[1] = 0x99;
    try {
      decodeEnvelope(bytes);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as CryptoError).code).toBe(DecryptErrorCode.UnsupportedAlgorithm);
    }
  });
});
