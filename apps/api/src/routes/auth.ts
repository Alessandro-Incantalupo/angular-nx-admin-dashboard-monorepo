import { Hono } from 'hono';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { loginSchema, passwordChangeSchema } from '@dashboard/models';
import type { AppEnv, Deps } from '../context';
import { user as userTable } from '../db/schema';
import { clientIp } from '../lib/client-ip';
import { signedIn } from '../lib/access';
import { problem } from '../lib/problem';
import { validate } from '../lib/validate';

const WRONG_LOGIN = 'Email or password is incorrect';
const BLOCKED = 'Too many failed attempts. Wait 15 minutes, then try again.';

/** Copies Better Auth's Set-Cookie headers onto our response. */
function forwardCookies(
  from: Headers,
  to: { header: (k: string, v: string, o?: { append?: boolean }) => void }
) {
  for (const cookie of from.getSetCookie())
    to.header('Set-Cookie', cookie, { append: true });
}

const isStatus = (err: unknown, ...codes: number[]) =>
  err instanceof APIError && codes.includes(err.statusCode);

export function authRoutes({ db, auth, throttle, env }: Deps) {
  return new Hono<AppEnv>()
    .post('/login', validate('json', loginSchema), async c => {
      const { email, password } = c.req.valid('json');
      const accountKey = throttle.key('email', email);
      const ipKey = throttle.key('ip', clientIp(c, env.TRUSTED_PROXY_HOPS));
      if (await throttle.blocked(accountKey, ipKey)) {
        return problem(c, 429, { detail: BLOCKED }, { 'Retry-After': '900' });
      }
      try {
        const { headers } = await auth.api.signInEmail({
          body: { email, password },
          headers: c.req.raw.headers,
          returnHeaders: true,
        });
        forwardCookies(headers, c);
        const [row] = await db
          .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            role: userTable.role,
            demo: userTable.demo,
          })
          .from(userTable)
          .where(eq(userTable.email, email));
        return c.json(row);
      } catch (err) {
        // Unknown email and wrong password get the same answer and the same count.
        if (isStatus(err, 401)) {
          await throttle.record(accountKey, ipKey);
          return problem(c, 401, { title: WRONG_LOGIN });
        }
        throw err;
      }
    })

    .post('/logout', async c => {
      try {
        const { headers } = await auth.api.signOut({
          headers: c.req.raw.headers,
          returnHeaders: true,
        });
        forwardCookies(headers, c);
      } catch {
        // No session: nothing to end.
      }
      return c.body(null, 204);
    })

    .get('/session', c => c.json(c.get('user')))

    .post('/password', validate('json', passwordChangeSchema), async c => {
      const user = signedIn(c);
      if (user.demo) {
        return problem(c, 403, {
          detail:
            "The demo account's password can't be changed, so it keeps working for everyone.",
        });
      }
      const { currentPassword, newPassword } = c.req.valid('json');
      const accountKey = throttle.key('account', user.id);
      const ipKey = throttle.key('ip', clientIp(c, env.TRUSTED_PROXY_HOPS));
      if (await throttle.blocked(accountKey, ipKey)) {
        return problem(c, 429, { detail: BLOCKED }, { 'Retry-After': '900' });
      }
      try {
        const { headers } = await auth.api.changePassword({
          body: { currentPassword, newPassword, revokeOtherSessions: true },
          headers: c.req.raw.headers,
          returnHeaders: true,
        });
        forwardCookies(headers, c);
        return c.body(null, 204);
      } catch (err) {
        if (isStatus(err, 400, 401)) {
          await throttle.record(accountKey, ipKey);
          return problem(c, 422, {
            errors: [
              {
                path: 'currentPassword',
                message: 'The current password is not right',
              },
            ],
          });
        }
        throw err;
      }
    });
}
