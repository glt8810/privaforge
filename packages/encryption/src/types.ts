/**
 * Public types for the PrivaForge encryption package.
 * All byte arrays are Uint8Array. Strings are UTF-8.
 */

export const ENVELOPE_VERSION = 0x01 as const;
export const ALG_AES_256_GCM = 0x01 as const;

export const IV_LENGTH = 12;
export const GCM_TAG_LENGTH = 16;
export const KEY_LENGTH = 32;
export const SALT_LENGTH = 16;

export const MAX_PLAINTEXT_BYTES = 64 * 1024 * 1024;

export type AlgorithmId = typeof ALG_AES_256_GCM;

export interface Argon2idParams {
  readonly memLimitBytes: number;
  readonly opsLimit: number;
}

export const DEFAULT_ARGON2ID_PARAMS: Argon2idParams = {
  memLimitBytes: 128 * 1024 * 1024,
  opsLimit: 3,
};

/** Binds a ciphertext to its logical location so it cannot be swapped. */
export interface AssociatedData {
  readonly userId: string;
  readonly resourceType: 'prompt' | 'version' | 'title' | 'note';
  readonly resourceId: string;
  readonly version: number;
}

/** The on-wire / at-rest envelope. */
export interface Envelope {
  readonly version: typeof ENVELOPE_VERSION;
  readonly alg: AlgorithmId;
  readonly iv: Uint8Array;
  readonly ciphertext: Uint8Array;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
