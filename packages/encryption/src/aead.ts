import { serializeAAD } from './aad.js';
import { encodeEnvelope, decodeEnvelope } from './envelope.js';
import { CryptoError, DecryptErrorCode } from './errors.js';
import { getSubtle, randomBytes } from './platform.js';
import {
  ALG_AES_256_GCM,
  ENVELOPE_VERSION,
  IV_LENGTH,
  MAX_PLAINTEXT_BYTES,
  type AssociatedData,
} from './types.js';

/**
 * Encrypts a UTF-8 string with AES-256-GCM, producing a self-describing envelope.
 *
 * - Generates a fresh 96-bit random IV for every call.
 * - Binds the ciphertext to the given AAD; decryption with a different AAD fails.
 * - Rejects plaintexts larger than {@link MAX_PLAINTEXT_BYTES}.
 */
export async function encryptString(
  plaintext: string,
  key: CryptoKey,
  ad: AssociatedData,
): Promise<Uint8Array> {
  const pt = new TextEncoder().encode(plaintext);
  return encryptBytes(pt, key, ad);
}

export async function encryptBytes(
  plaintext: Uint8Array,
  key: CryptoKey,
  ad: AssociatedData,
): Promise<Uint8Array> {
  if (plaintext.length > MAX_PLAINTEXT_BYTES) {
    throw new CryptoError(
      'INVALID_INPUT',
      `plaintext exceeds max size (${MAX_PLAINTEXT_BYTES} bytes)`,
    );
  }
  const iv = randomBytes(IV_LENGTH);
  const aad = serializeAAD(ad);
  const subtle = getSubtle();

  const ciphertext = new Uint8Array(
    await subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      key,
      plaintext,
    ),
  );

  return encodeEnvelope({
    version: ENVELOPE_VERSION,
    alg: ALG_AES_256_GCM,
    iv,
    ciphertext,
  });
}

/**
 * Decrypts an envelope produced by {@link encryptString}. Returns the original
 * UTF-8 string, or throws a {@link CryptoError} with code `AUTH_FAILED` if the
 * ciphertext, IV, or AAD has been tampered with, or the key is wrong.
 */
export async function decryptString(
  envelopeBytes: Uint8Array,
  key: CryptoKey,
  ad: AssociatedData,
): Promise<string> {
  const pt = await decryptBytes(envelopeBytes, key, ad);
  return new TextDecoder('utf-8', { fatal: true }).decode(pt);
}

export async function decryptBytes(
  envelopeBytes: Uint8Array,
  key: CryptoKey,
  ad: AssociatedData,
): Promise<Uint8Array> {
  const env = decodeEnvelope(envelopeBytes);
  const aad = serializeAAD(ad);
  const subtle = getSubtle();

  try {
    const pt = await subtle.decrypt(
      { name: 'AES-GCM', iv: env.iv, additionalData: aad, tagLength: 128 },
      key,
      env.ciphertext,
    );
    return new Uint8Array(pt);
  } catch {
    // Web Crypto intentionally returns an opaque error on auth failure to avoid
    // oracle leakage. Normalise to our typed error without leaking details.
    throw new CryptoError(
      DecryptErrorCode.AuthFailed,
      'decryption failed: auth tag mismatch, wrong key, or tampered ciphertext',
    );
  }
}
