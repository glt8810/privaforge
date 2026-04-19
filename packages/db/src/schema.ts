/**
 * Drizzle schema for PrivaForge.
 *
 * Invariant: every column that might hold user-provided content is either
 *   1. `bytea` (holding an opaque encrypted envelope produced by
 *      `@privaforge/encryption`), or
 *   2. a fixed-length hash (e.g. sha256 of a tag), or
 *   3. a public field that the user explicitly chose to publish
 *      (marketplace titles, descriptions, prices).
 *
 * Any new column holding potentially-sensitive text MUST be reviewed by the
 * security reviewer in the PR and added to the list in SECURITY.md.
 */

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; default: false }>({
  dataType: () => 'bytea',
});

export const planEnum = pgEnum('plan', ['free', 'pro', 'team', 'enterprise']);
export const listingStatusEnum = pgEnum('listing_status', ['active', 'paused', 'removed']);
export const resourceTypeEnum = pgEnum('resource_type', ['prompt', 'version', 'title', 'note']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 320 }).notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    masterKeySalt: bytea('master_key_salt').notNull(),
    backupCodeHashes: text('backup_code_hashes').array(),
    stripeCustomerId: text('stripe_customer_id'),
    plan: planEnum('plan').notNull().default('free'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    emailUnique: uniqueIndex('users_email_unique').on(t.email),
    saltLen: check('users_master_key_salt_len', sql`octet_length(${t.masterKeySalt}) = 16`),
  }),
);

export const vaults = pgTable(
  'vaults',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Salt used in HKDF to derive the per-vault key. Random, non-secret. */
    vaultSalt: bytea('vault_salt').notNull(),
    /** Encrypted display name (envelope) — never stored plaintext. */
    nameEncrypted: bytea('name_encrypted'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('vaults_user_idx').on(t.userId),
    saltLen: check('vaults_vault_salt_len', sql`octet_length(${t.vaultSalt}) = 16`),
  }),
);

export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    vaultId: uuid('vault_id')
      .notNull()
      .references(() => vaults.id, { onDelete: 'cascade' }),
    folderId: uuid('folder_id'),
    /** Full envelope bytes — version + alg + iv + ciphertext+tag. */
    encryptedContent: bytea('encrypted_content').notNull(),
    titleEncrypted: bytea('title_encrypted'),
    /** One-way hashes (sha256 hex) so the server can filter by tag without seeing tag text. */
    tagHashes: text('tag_hashes').array().notNull().default(sql`'{}'::text[]`),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('prompts_user_idx').on(t.userId),
    vaultIdx: index('prompts_vault_idx').on(t.vaultId),
    versionPositive: check('prompts_version_positive', sql`${t.version} > 0`),
  }),
);

export const promptVersions = pgTable(
  'prompt_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'cascade' }),
    encryptedContent: bytea('encrypted_content').notNull(),
    parentVersionId: uuid('parent_version_id'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    version: integer('version').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    promptIdx: index('prompt_versions_prompt_idx').on(t.promptId),
    uniquePromptVersion: uniqueIndex('prompt_versions_prompt_version_uniq').on(
      t.promptId,
      t.version,
    ),
  }),
);

export const marketplaceListings = pgTable(
  'marketplace_listings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sellerId: uuid('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    /**
     * The seller's encrypted prompt. When a buyer purchases, we issue them a
     * fresh envelope encrypted to their vault key via a key-wrap protocol
     * (not yet implemented — tracked for M2, see ADR-0003 when written).
     */
    promptId: uuid('prompt_id')
      .notNull()
      .references(() => prompts.id, { onDelete: 'restrict' }),
    // PUBLIC fields — sellers explicitly publish these.
    title: varchar('title', { length: 120 }).notNull(),
    description: text('description').notNull().default(''),
    category: varchar('category', { length: 64 }).notNull().default('general'),
    priceCents: integer('price_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    ratingAvg: numeric('rating_avg', { precision: 3, scale: 2 }).notNull().default('0'),
    salesCount: integer('sales_count').notNull().default(0),
    status: listingStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index('listings_status_idx').on(t.status),
    sellerIdx: index('listings_seller_idx').on(t.sellerId),
    priceCheck: check('listings_price_positive', sql`${t.priceCents} >= 100`),
  }),
);

export const usageLogs = pgTable(
  'usage_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /**
     * Aggregation-only: we store counts and costs, NEVER prompt text. The
     * prompt_id FK exists so the user can join against their own vault
     * client-side, but server-side analytics must not decrypt.
     */
    promptId: uuid('prompt_id').references(() => prompts.id, { onDelete: 'set null' }),
    model: varchar('model', { length: 64 }).notNull(),
    tokensIn: integer('tokens_in').notNull(),
    tokensOut: integer('tokens_out').notNull(),
    costMicroUsd: integer('cost_micro_usd').notNull(),
    success: boolean('success'),
    extra: jsonb('extra'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userTimeIdx: index('usage_user_time_idx').on(t.userId, t.timestamp),
  }),
);

// ---------- Relations ----------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  vaults: many(vaults),
  prompts: many(prompts),
}));

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
  user: one(users, { fields: [vaults.userId], references: [users.id] }),
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  user: one(users, { fields: [prompts.userId], references: [users.id] }),
  vault: one(vaults, { fields: [prompts.vaultId], references: [vaults.id] }),
  versions: many(promptVersions),
}));
