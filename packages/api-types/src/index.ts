/**
 * @privaforge/api-types
 *
 * Zod schemas shared between client and server. Every API boundary MUST
 * parse through one of these schemas before trusting its input.
 */

import { z } from 'zod';

// ---------- Primitive shapes ---------------------------------------------

/** Base64URL-encoded bytes. Enforces alphabet + length hints. */
export const Base64Url = z
  .string()
  .regex(/^[A-Za-z0-9_-]*$/, 'must be base64url')
  .min(1)
  .max(64 * 1024 * 1024); // safety cap mirrors MAX_PLAINTEXT_BYTES in encryption pkg

export const Uuid = z.string().uuid();

export const IsoTimestamp = z.string().datetime({ offset: true });

export const Plan = z.enum(['free', 'pro', 'team', 'enterprise']);
export type Plan = z.infer<typeof Plan>;

// ---------- Users / Auth -------------------------------------------------

export const RegisterRequest = z.object({
  email: z.string().email().max(320),
  /** 16 random bytes, base64url-encoded. Sent by the client after local generation. */
  masterKeySalt: Base64Url,
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  userId: Uuid,
  plan: Plan,
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const LoginChallengeResponse = z.object({
  /** Server-stored Argon2id salt, base64url. Client derives the master key locally. */
  masterKeySalt: Base64Url,
  userId: Uuid,
});
export type LoginChallengeResponse = z.infer<typeof LoginChallengeResponse>;

// ---------- Prompts (all content is encrypted) ---------------------------

const PromptEnvelope = z.object({
  /** Base64url-encoded bytes of the entire envelope (version || alg || iv || ct||tag). */
  encrypted: Base64Url,
  /**
   * AAD version number — must match the version field baked into the ciphertext's AAD.
   * Incrementing this invalidates the old ciphertext, forcing a re-encryption.
   */
  aadVersion: z.number().int().min(1).max(2 ** 31 - 1),
});

export const CreatePromptRequest = z.object({
  vaultId: Uuid,
  folderId: Uuid.nullable(),
  /** Content envelope. Server never sees plaintext. */
  content: PromptEnvelope,
  /** Optional encrypted title envelope. Unencrypted titles are NOT allowed. */
  title: PromptEnvelope.nullable(),
  /** Hashed tags (one-way). Server can group by tag without seeing tag names. */
  tagHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)).max(32),
});
export type CreatePromptRequest = z.infer<typeof CreatePromptRequest>;

export const PromptRecord = z.object({
  id: Uuid,
  vaultId: Uuid,
  folderId: Uuid.nullable(),
  content: PromptEnvelope,
  title: PromptEnvelope.nullable(),
  tagHashes: z.array(z.string()),
  version: z.number().int().min(1),
  createdAt: IsoTimestamp,
  updatedAt: IsoTimestamp,
});
export type PromptRecord = z.infer<typeof PromptRecord>;

export const UpdatePromptRequest = z.object({
  content: PromptEnvelope.optional(),
  title: PromptEnvelope.nullable().optional(),
  folderId: Uuid.nullable().optional(),
  tagHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)).max(32).optional(),
  /** The version the client last saw — for optimistic concurrency control. */
  expectedVersion: z.number().int().min(1),
});
export type UpdatePromptRequest = z.infer<typeof UpdatePromptRequest>;

// ---------- Marketplace --------------------------------------------------

export const MarketplaceListing = z.object({
  id: Uuid,
  sellerId: Uuid,
  // PUBLIC metadata — the seller explicitly publishes these fields.
  title: z.string().min(3).max(120),
  description: z.string().max(4000),
  category: z.string().max(64),
  priceCents: z.number().int().min(100).max(1_000_000),
  currency: z.literal('USD'),
  ratingAvg: z.number().min(0).max(5),
  salesCount: z.number().int().min(0),
  status: z.enum(['active', 'paused', 'removed']),
  createdAt: IsoTimestamp,
});
export type MarketplaceListing = z.infer<typeof MarketplaceListing>;

// ---------- Error envelope -----------------------------------------------

export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  /** Never contains plaintext. Safe to log. */
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiError>;
