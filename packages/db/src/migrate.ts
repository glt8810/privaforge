/**
 * One-shot migration runner invoked by `pnpm --filter @privaforge/db db:migrate`.
 * Intentionally separate from the serverless HTTP driver — migrations use a
 * direct TCP connection via `postgres` for transaction support.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to run migrations');
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

await migrate(db, { migrationsFolder: './migrations' });
await client.end();

console.warn('migrations complete');
