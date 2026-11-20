import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { createApp } from '../src/app';
import type { Db } from '../src/db/client';
import * as schema from '../src/db/schema';
import { DEMO_ACCOUNT, resetDemo } from '../src/db/seed';
import { readEnv } from '../src/env';

export const ORIGIN = 'https://dashboard.test';
export const ADMIN = {
  email: 'admin@example.com',
  password: 'admin-password-for-tests',
};
export const VIEWER = {
  email: DEMO_ACCOUNT.email,
  password: DEMO_ACCOUNT.password,
};

/** A fresh app on an in-memory Postgres (PGlite), migrated and seeded like production. */
export async function setup() {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Db;
  await migrate(drizzle(client, { schema }), {
    migrationsFolder: new URL('../drizzle', import.meta.url).pathname,
  });
  const env = readEnv({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://unused@localhost/test',
    BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-123',
    FRONTEND_ORIGIN: ORIGIN,
    TRUSTED_PROXY_HOPS: '1',
  });
  await resetDemo(db, {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: ORIGIN,
    adminPassword: ADMIN.password,
  });
  const app = createApp(db, env);

  let ip = 1;
  /** A request as the browser would send it through the front end's origin. */
  const call = (
    method: string,
    path: string,
    opts: {
      body?: unknown;
      cookie?: string;
      origin?: string | null;
      ip?: string;
    } = {}
  ) => {
    const headers: Record<string, string> = {
      'x-forwarded-for': opts.ip ?? `198.51.100.${ip}`,
    };
    if (opts.origin !== null) headers['origin'] = opts.origin ?? ORIGIN;
    if (opts.cookie) headers['cookie'] = opts.cookie;
    if (opts.body !== undefined) headers['content-type'] = 'application/json';
    return app.request(path, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  };

  /** Signs in and returns the session cookie to send back. */
  const login = async (who: { email: string; password: string }) => {
    ip++; // a different client per login, so the IP limit doesn't carry over between tests
    const res = await call('POST', '/api/auth/login', { body: who });
    if (res.status !== 200)
      throw new Error(`login failed: ${res.status} ${await res.text()}`);
    return res.headers
      .getSetCookie()
      .map(c => c.split(';')[0])
      .join('; ');
  };

  return { app, db, client, call, login, close: () => client.close() };
}

/** A response body as loosely typed JSON, for assertions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const json = (res: Response): Promise<any> => res.json();
