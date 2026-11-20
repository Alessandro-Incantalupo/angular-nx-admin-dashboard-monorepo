import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Db } from './db/client';
import * as schema from './db/schema';

export interface AuthOptions {
  db: Db;
  secret: string;
  /** The front end's origin: the browser reaches the API through it. */
  baseURL: string;
  trustedOrigins: string[];
  /** Only the seed script creates accounts; the app never offers sign-up. */
  allowSignUp?: boolean;
}

/**
 * Better Auth, used as a library: the routes in routes/auth.ts call
 * `auth.api.*` and its own HTTP handler is never mounted, so none of its
 * endpoints (sign-up, reset, OAuth...) can be reached from outside.
 */
export function createAuth(o: AuthOptions) {
  const secure = o.baseURL.startsWith('https://');
  return betterAuth({
    appName: 'Admin Dashboard',
    baseURL: o.baseURL,
    secret: o.secret,
    trustedOrigins: o.trustedOrigins,
    database: drizzleAdapter(o.db, { provider: 'pg', schema }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !o.allowSignUp,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      // Changing the password signs the account out everywhere else.
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      additionalFields: {
        role: { type: 'string', input: false, defaultValue: 'viewer' },
        demo: { type: 'boolean', input: false, defaultValue: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 8, // a working day
      updateAge: 60 * 60, // slide the expiry at most once an hour
    },
    advanced: {
      useSecureCookies: secure,
      defaultCookieAttributes: {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
      },
      // The throttle in lib/throttle.ts keys on a hash of the IP instead.
      ipAddress: { disableIpTracking: true },
    },
    // Better Auth's limiter only covers its HTTP routes, which aren't mounted.
    rateLimit: { enabled: false },
    telemetry: { enabled: false },
    logger: { level: 'error' },
  });
}

export type Auth = ReturnType<typeof createAuth>;
