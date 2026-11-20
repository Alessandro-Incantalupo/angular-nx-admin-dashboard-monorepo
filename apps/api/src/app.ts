import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { routePath } from 'hono/route';
import { secureHeaders } from 'hono/secure-headers';
import { sql } from 'drizzle-orm';
import { createAuth } from './auth';
import type { AppEnv, Deps } from './context';
import type { Db } from './db/client';
import type { Env } from './env';
import { access, sameOriginWrites } from './lib/access';
import { problem } from './lib/problem';
import { writeLimit } from './lib/rate-limit';
import { createThrottle } from './lib/throttle';
import { authRoutes } from './routes/auth';
import { memberRoutes } from './routes/members';
import { settingsRoutes } from './routes/settings';
import { statsRoutes } from './routes/stats';

export function createApp(db: Db, env: Env) {
  const deps: Deps = {
    db,
    env,
    auth: createAuth({
      db,
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.FRONTEND_ORIGIN[0],
      trustedOrigins: env.FRONTEND_ORIGIN,
    }),
    throttle: createThrottle(db, env.BETTER_AUTH_SECRET),
  };

  const app = new Hono<AppEnv>().basePath('/api');

  // One line per request: method, route pattern, status, time. No query
  // strings, ids, emails or IPs, so the logs hold no personal data.
  if (env.NODE_ENV !== 'test') {
    app.use(async (c, next) => {
      const start = performance.now();
      await next();
      console.log(
        JSON.stringify({
          method: c.req.method,
          route: routePath(c, -1),
          status: c.res.status,
          ms: Math.round(performance.now() - start),
        })
      );
    });
  }

  app.use(
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
      crossOriginResourcePolicy: 'same-origin',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: 'max-age=63072000; includeSubDomains',
    })
  );
  app.use(async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store');
  });
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowHeaders: ['Content-Type'],
      maxAge: 600,
    })
  );
  app.use(sameOriginWrites(env.FRONTEND_ORIGIN));
  app.use(bodyLimit({ maxSize: 16 * 1024, onError: c => problem(c, 413) }));
  app.use(access(deps.auth));
  app.use(
    writeLimit({
      limit: 60,
      windowMs: 5 * 60_000,
      key: c => c.get('user')?.id ?? 'anonymous',
    })
  );

  app.get('/health', async c => {
    await db.execute(sql`select 1`);
    return c.json({ ok: true });
  });
  app.route('/auth', authRoutes(deps));
  app.route('/members', memberRoutes(deps));
  app.route('/stats', statsRoutes(deps));
  app.route('/settings', settingsRoutes(deps));

  app.notFound(c => problem(c, 404));
  app.onError((err, c) => {
    // Name and message only, never request data or query parameters (a
    // failed query's message lists them). No stack in the response.
    const cause = err.cause instanceof Error ? err.cause : undefined;
    console.error(
      JSON.stringify({
        level: 'error',
        method: c.req.method,
        route: routePath(c, -1),
        error: err.name,
        message: err.message.split('\n')[0],
        cause: cause
          ? `${cause.name}: ${cause.message.split('\n')[0]}`
          : undefined,
      })
    );
    return problem(c, 500);
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
