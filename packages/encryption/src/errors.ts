export const DecryptErrorCode = {
  MalformedEnvelope: 'MALFORMED_ENVELOPE',
  UnsupportedVersion: 'UNSUPPORTED_VERSION',
  UnsupportedAlgorithm: 'UNSUPPORTED_ALGORITHM',
  AuthFailed: 'AUTH_FAILED',
  Internal: 'INTERNAL',
} as const;

export type DecryptErrorCode = (typeof DecryptErrorCode)[keyof typeof DecryptErrorCode];

export class CryptoError extends Error {
  public override readonly name = 'CryptoError';
  constructor(
    public readonly code: DecryptErrorCode | 'INVALID_INPUT' | 'UNAVAILABLE',
    message: string,
  ) {
    super(message);
  }
}
