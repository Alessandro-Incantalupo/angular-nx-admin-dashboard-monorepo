import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ACCOUNT_LIMIT, IP_LIMIT } from '../src/lib/throttle';
import { ADMIN, VIEWER, json, setup } from './harness';

describe('login', () => {
  let t: Awaited<ReturnType<typeof setup>>;
  beforeAll(async () => {
    t = await setup();
  });
  afterAll(() => t.close());

  const attempt = (email: string, password: string, ip: string) =>
    t.call('POST', '/api/auth/login', { body: { email, password }, ip });

  it('sets an HttpOnly, Secure, SameSite=Lax session cookie', async () => {
    const res = await attempt(ADMIN.email, ADMIN.password, '203.0.113.1');
    expect(res.status).toBe(200);
    const cookie =
      res.headers.getSetCookie().find(c => c.includes('session_token')) ?? '';
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(await json(res)).toMatchObject({
      email: ADMIN.email,
      role: 'admin',
    });
  });

  it('gives the same answer for an unknown email and a wrong password', async () => {
    const unknown = await attempt(
      'nobody@example.com',
      'whatever-password',
      '203.0.113.2'
    );
    const wrong = await attempt(ADMIN.email, 'not-the-password', '203.0.113.2');
    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(await json(unknown)).toEqual(await json(wrong));
  });

  it(`blocks an account after ${ACCOUNT_LIMIT} wrong passwords, even with the right one, from any IP`, async () => {
    for (let i = 0; i < ACCOUNT_LIMIT; i++) {
      expect(
        (await attempt(VIEWER.email, `wrong-${i}`, `203.0.113.${10 + i}`))
          .status
      ).toBe(401);
    }
    const blocked = await attempt(
      VIEWER.email,
      VIEWER.password,
      '203.0.113.99'
    );
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('900');
    // Another account is not affected.
    expect(
      (await attempt(ADMIN.email, ADMIN.password, '203.0.113.98')).status
    ).toBe(200);
  });

  it(`blocks an IP after ${IP_LIMIT} wrong passwords across accounts`, async () => {
    const ip = '192.0.2.50';
    for (let i = 0; i < IP_LIMIT; i++) {
      expect(
        (await attempt(`user${i}@example.com`, 'wrong-password', ip)).status
      ).toBe(401);
    }
    expect((await attempt(ADMIN.email, ADMIN.password, ip)).status).toBe(429);
    expect(
      (await attempt(ADMIN.email, ADMIN.password, '192.0.2.51')).status
    ).toBe(200);
  });

  it('stores hashes in the throttle table, never the email or the IP', async () => {
    const { rows } = await t.client.query<{ key: string }>(
      'select key from login_failure'
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const { key } of rows) {
      expect(key).not.toContain('@');
      expect(key).not.toMatch(/\d+\.\d+\.\d+\.\d+/);
    }
  });

  it('logs out: the cookie stops working', async () => {
    const res = await attempt(ADMIN.email, ADMIN.password, '203.0.113.200');
    const cookie = res.headers
      .getSetCookie()
      .map(c => c.split(';')[0])
      .join('; ');
    expect((await t.call('GET', '/api/auth/session', { cookie })).status).toBe(
      200
    );
    expect((await t.call('POST', '/api/auth/logout', { cookie })).status).toBe(
      204
    );
    // Signed out: the session check answers null, not an error.
    expect(
      await json(await t.call('GET', '/api/auth/session', { cookie }))
    ).toBeNull();
  });
});

describe('password change', () => {
  let t: Awaited<ReturnType<typeof setup>>;
  beforeAll(async () => {
    t = await setup();
  });
  afterAll(() => t.close());

  const change = (
    cookie: string,
    currentPassword: string,
    newPassword = 'another-long-password'
  ) =>
    t.call('POST', '/api/auth/password', {
      cookie,
      body: { currentPassword, newPassword, confirmPassword: newPassword },
      ip: '203.0.113.7',
    });

  it('is refused for the demo account', async () => {
    const cookie = await t.login(VIEWER);
    expect((await change(cookie, VIEWER.password)).status).toBe(403);
  });

  it('counts wrong current passwords like failed logins', async () => {
    const cookie = await t.login(ADMIN);
    for (let i = 0; i < ACCOUNT_LIMIT; i++) {
      const res = await change(cookie, `wrong-${i}`);
      expect(res.status).toBe(422);
      expect((await json(res)).errors[0].path).toBe('currentPassword');
    }
    expect((await change(cookie, ADMIN.password)).status).toBe(429);
  });
});

describe('password change, happy path', () => {
  it('changes the password and signs other sessions out', async () => {
    const t = await setup();
    const first = await t.login(ADMIN);
    const second = await t.login(ADMIN);
    const res = await t.call('POST', '/api/auth/password', {
      cookie: first,
      body: {
        currentPassword: ADMIN.password,
        newPassword: 'a-new-admin-password',
        confirmPassword: 'a-new-admin-password',
      },
    });
    expect(res.status).toBe(204);
    expect(
      await json(await t.call('GET', '/api/auth/session', { cookie: second }))
    ).toBeNull();
    await t.login({ email: ADMIN.email, password: 'a-new-admin-password' });
    await t.close();
  });
});
