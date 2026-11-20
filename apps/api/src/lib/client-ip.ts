import type { Context } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';

/**
 * The client's IP, for rate limits only (it is hashed before it is stored).
 * With `hops` trusted proxies in front of the API, the client is the address
 * `hops` places from the right of X-Forwarded-For: those entries were added by
 * our proxies, anything further left could have been sent by the client.
 */
export function clientIp(c: Context, hops: number): string {
  if (hops > 0) {
    const chain = (c.req.header('x-forwarded-for') ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const ip = chain[chain.length - hops];
    if (ip) return ip;
  }
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    return 'unknown'; // no socket, e.g. app.request() in tests
  }
}
