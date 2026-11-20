import { createHmac } from 'node:crypto';
import { and, count, eq, gte, lt } from 'drizzle-orm';
import type { Db } from '../db/client';
import { loginFailure } from '../db/schema';

export const WINDOW_MS = 15 * 60_000;
/** Wrong passwords per account (email or account id) in the window. */
export const ACCOUNT_LIMIT = 5;
/** Wrong passwords per client IP in the window, across accounts. */
export const IP_LIMIT = 20;

/**
 * Counts failed logins and failed password changes in the database, so the
 * limit holds across restarts and instances. Keys are HMACs of the email,
 * the account id or the IP: the table never holds the values themselves.
 */
export function createThrottle(db: Db, secret: string) {
  const key = (kind: 'email' | 'account' | 'ip', value: string) =>
    `${kind}:${createHmac('sha256', secret)
      .update(`${kind}:${value.trim().toLowerCase()}`)
      .digest('base64url')
      .slice(0, 32)}`;

  async function failures(k: string): Promise<number> {
    const [row] = await db
      .select({ n: count() })
      .from(loginFailure)
      .where(
        and(
          eq(loginFailure.key, k),
          gte(loginFailure.createdAt, new Date(Date.now() - WINDOW_MS))
        )
      );
    return row?.n ?? 0;
  }

  return {
    key,
    /** True when the account key or the IP key has reached its limit. */
    async blocked(accountKey: string, ipKey: string): Promise<boolean> {
      const [a, i] = await Promise.all([failures(accountKey), failures(ipKey)]);
      return a >= ACCOUNT_LIMIT || i >= IP_LIMIT;
    },
    async record(accountKey: string, ipKey: string): Promise<void> {
      await db
        .insert(loginFailure)
        .values([{ key: accountKey }, { key: ipKey }]);
      // Housekeeping: nothing older than a day is needed.
      await db
        .delete(loginFailure)
        .where(lt(loginFailure.createdAt, new Date(Date.now() - 86_400_000)));
    },
  };
}

export type Throttle = ReturnType<typeof createThrottle>;
