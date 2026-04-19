import { defineConfig } from 'drizzle-kit';

// DATABASE_URL is only strictly required for `db:migrate` and `db:studio`
// (which connect to the real database). `drizzle-kit generate` reads the
// schema only and works fine with a placeholder, which means CI / offline
// developers can regenerate migration SQL without credentials. The migrate
// script itself (src/migrate.ts) validates DATABASE_URL at runtime.
const url = process.env.DATABASE_URL ?? 'postgres://placeholder@localhost/placeholder';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
