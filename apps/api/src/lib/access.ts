import type { Context, MiddlewareHandler } from 'hono';
import type { SessionUser } from '@dashboard/models';
import type { Auth } from '../auth';
import type { AppEnv } from '../context';
import { problem } from './problem';

/** Routes anyone may call. */
const PUBLIC = new Set([
  'GET /api/health',
  'POST /api/auth/login',
  'POST /api/auth/logout',
]);

/** Routes anyone may call, that still need to know who is signed in (answer: maybe nobody). */
const SESSION_OPTIONAL = new Set(['GET /api/auth/session']);

/** Writes any signed-in account may make about itself (the handler adds its own checks). */
const SELF_SERVICE = new Set(['POST /api/auth/password']);

const READ = new Set(['GET', 'HEAD']);

/**
 * The one place that decides who may call what, for every route:
 * - public routes: anyone (the session check answers null when signed out);
 * - reads: any signed-in account (admin or viewer);
 * - writes: admins only, unless listed in SELF_SERVICE.
 * A new write route is admin-only until someone decides otherwise. The
 * Angular guards mirror this for the UI; they protect nothing.
 */
export function access(auth: Auth): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set('user', null);
    const route = `${c.req.method} ${c.req.path}`;
    if (PUBLIC.has(route)) return next();

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return SESSION_OPTIONAL.has(route) ? next() : problem(c, 401);
    const u = session.user as typeof session.user & {
      role?: string;
      demo?: boolean;
    };
    const user: SessionUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === 'admin' ? 'admin' : 'viewer',
      demo: u.demo === true,
    };
    c.set('user', user);

    if (READ.has(c.req.method) || SELF_SERVICE.has(route)) return next();
    if (user.role !== 'admin') {
      return problem(c, 403, {
        detail: 'Your account can view this workspace but not change it.',
      });
    }
    return next();
  };
}

/**
 * Cookie-authenticated writes must come from our own front end. SameSite=Lax
 * already keeps the cookie off cross-site POSTs; this is the second lock.
 */
export function sameOriginWrites(allowed: string[]): MiddlewareHandler {
  return async (c, next) => {
    if (READ.has(c.req.method) || c.req.method === 'OPTIONS') return next();
    const origin = c.req.header('origin');
    if (!origin || !allowed.includes(origin)) {
      return problem(c, 403, {
        detail: 'This request did not come from the dashboard.',
      });
    }
    return next();
  };
}

/** The signed-in account on a route the access middleware has already guarded. */
export function signedIn(c: Context<AppEnv>): SessionUser {
  const user = c.get('user');
  if (!user) throw new Error('signedIn() called on a route without a session');
  return user;
}
