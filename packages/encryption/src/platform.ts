import { CryptoError } from './errors.js';

/**
 * Returns the platform's SubtleCrypto (browser, Node 20+, or polyfill).
 * Fails loudly if unavailable — this package must never silently fall back
 * to a weaker implementation.
 */
export function getSubtle(): SubtleCrypto {
  const g = globalThis as { crypto?: Crypto };
  if (!g.crypto?.subtle) {
    throw new CryptoError(
      'UNAVAILABLE',
      'SubtleCrypto is not available in this environment. Requires a modern browser or Node >= 20.',
    );
  }
  return g.crypto.subtle;
}

/** CSPRNG — fills `out` with cryptographically strong random bytes. */
export function randomBytes(length: number): Uint8Array {
  const g = globalThis as { crypto?: Crypto };
  if (!g.crypto?.getRandomValues) {
    throw new CryptoError('UNAVAILABLE', 'crypto.getRandomValues is not available.');
  }
  const out = new Uint8Array(length);
  g.crypto.getRandomValues(out);
  return out;
}

/** Constant-time-adjacent byte comparison. Use for non-AEAD comparisons only. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}
