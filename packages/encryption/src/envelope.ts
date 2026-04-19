import { CryptoError, DecryptErrorCode } from './errors.js';
import {
  ALG_AES_256_GCM,
  ENVELOPE_VERSION,
  type Envelope,
  GCM_TAG_LENGTH,
  IV_LENGTH,
} from './types.js';

/**
 * Encodes an envelope to a flat byte array:
 *   [version:1][alg:1][iv:12][ciphertext||tag]
 */
export function encodeEnvelope(env: Envelope): Uint8Array<ArrayBuffer> {
  if (env.iv.length !== IV_LENGTH) {
    throw new CryptoError('INVALID_INPUT', `IV must be ${IV_LENGTH} bytes`);
  }
  if (env.ciphertext.length < GCM_TAG_LENGTH) {
    throw new CryptoError('INVALID_INPUT', 'ciphertext too short to contain auth tag');
  }
  const out = new Uint8Array(2 + IV_LENGTH + env.ciphertext.length);
  out[0] = env.version;
  out[1] = env.alg;
  out.set(env.iv, 2);
  out.set(env.ciphertext, 2 + IV_LENGTH);
  return out;
}

/**
 * Decodes a flat byte array into an envelope. Performs format validation only;
 * authenticity is verified during decryption (GCM auth tag).
 */
export function decodeEnvelope(bytes: Uint8Array): Envelope {
  if (bytes.length < 2 + IV_LENGTH + GCM_TAG_LENGTH) {
    throw new CryptoError(DecryptErrorCode.MalformedEnvelope, 'envelope truncated');
  }
  const version = bytes[0];
  const alg = bytes[1];
  if (version !== ENVELOPE_VERSION) {
    throw new CryptoError(
      DecryptErrorCode.UnsupportedVersion,
      `unsupported envelope version: ${version}`,
    );
  }
  if (alg !== ALG_AES_256_GCM) {
    throw new CryptoError(
      DecryptErrorCode.UnsupportedAlgorithm,
      `unsupported algorithm id: ${alg}`,
    );
  }
  return {
    version: ENVELOPE_VERSION,
    alg: ALG_AES_256_GCM,
    iv: bytes.slice(2, 2 + IV_LENGTH) as Uint8Array<ArrayBuffer>,
    ciphertext: bytes.slice(2 + IV_LENGTH) as Uint8Array<ArrayBuffer>,
  };
}
