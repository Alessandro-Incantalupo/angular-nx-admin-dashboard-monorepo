import type { MiddlewareHandler } from 'hono';
import { problem } from './problem';

/**
 * A fixed-window limit on writes, per key (the signed-in account). It counts
 * in memory: the API runs as one instance. The login limit, which matters
 * more, counts in the database (throttle.ts).
 */
export function writeLimit(opts: {
  limit: number;
  windowMs: number;
  key: (c: Parameters<MiddlewareHandler>[0]) => string;
}): MiddlewareHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (c, next) => {
    if (c.req.method === 'GET' || c.req.method === 'HEAD') return next();
    const now = Date.now();
    const k = opts.key(c);
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(k, entry);
      if (hits.size > 10_000) {
        for (const [key, e] of hits) if (e.resetAt <= now) hits.delete(key);
      }
    }
    entry.count++;
    if (entry.count > opts.limit) {
      const retry = Math.ceil((entry.resetAt - now) / 1000);
      return problem(
        c,
        429,
        {
          detail: `Too many changes in a short time. Try again in ${retry} seconds.`,
        },
        { 'Retry-After': String(retry) }
      );
    }
    return next();
  };
}
