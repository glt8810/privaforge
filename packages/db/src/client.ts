import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema.js';

neonConfig.fetchConnectionCache = true;

/**
 * Build a typed Drizzle client backed by Neon serverless HTTP driver.
 * Use this from Next.js route handlers and server actions.
 *
 * Do NOT import this module from client components. Import `@privaforge/db/schema`
 * if you only need the Drizzle schema types on the client.
 */
export function createDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema, logger: process.env.NODE_ENV === 'development' });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
