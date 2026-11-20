import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import * as schema from './schema';

/** Any Drizzle Postgres database with our schema: postgres.js in the app, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/**
 * Connects with postgres.js. `prepare: false` because a transaction pooler
 * (Neon's, PgBouncer) doesn't keep prepared statements between transactions.
 */
export function connect(url: string, max = 5) {
  const client = postgres(url, {
    prepare: false,
    max,
    onnotice: () => undefined,
  });
  return { db: drizzle(client, { schema }) as Db, close: () => client.end() };
}

export { schema };
