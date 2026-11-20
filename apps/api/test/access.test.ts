import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ADMIN, VIEWER, json, setup } from './harness';

const member = {
  name: 'Test Person',
  email: 'test.person@example.com',
  role: 'editor',
  status: 'active',
};
const settings = {
  workspaceName: 'Renamed',
  supportEmail: 'help@example.com',
  defaultLanguage: 'it',
  weekStartsOn: 'sunday',
};

describe('who may call what', () => {
  let t: Awaited<ReturnType<typeof setup>>;
  let admin: string;
  let viewer: string;
  let someId: string;

  beforeAll(async () => {
    t = await setup();
    admin = await t.login(ADMIN);
    viewer = await t.login(VIEWER);
    const list = await json(
      await t.call('GET', '/api/members?size=1', { cookie: admin })
    );
    someId = list.items[0].id;
  });
  afterAll(() => t.close());

  /** Every write route the app has, with a body that would pass validation. */
  const writes = () => [
    { method: 'POST', path: '/api/members', body: member },
    { method: 'PUT', path: `/api/members/${someId}`, body: member },
    { method: 'DELETE', path: `/api/members/${someId}` },
    { method: 'PUT', path: '/api/settings', body: settings },
    {
      method: 'POST',
      path: '/api/auth/password',
      body: {
        currentPassword: VIEWER.password,
        newPassword: 'a-brand-new-password',
        confirmPassword: 'a-brand-new-password',
      },
    },
  ];

  it('lists every write route the app registers', () => {
    // If this fails, a write route was added: add it to writes() above.
    const registered = t.app.routes
      .filter(r => !['GET', 'ALL', 'HEAD', 'OPTIONS'].includes(r.method))
      .map(r => `${r.method} ${r.path}`);
    const public_ = ['POST /api/auth/login', 'POST /api/auth/logout'];
    const tested = writes().map(
      w => `${w.method} ${w.path.replace(someId, ':id')}`
    );
    expect(new Set(registered.filter(r => !public_.includes(r)))).toEqual(
      new Set(tested)
    );
  });

  it('refuses every write to a viewer, and changes nothing', async () => {
    const before = await json(
      await t.call('GET', '/api/stats', { cookie: admin })
    );
    for (const w of writes()) {
      const res = await t.call(w.method, w.path, {
        body: w.body,
        cookie: viewer,
      });
      expect(res.status, `${w.method} ${w.path}`).toBe(403);
      expect(res.headers.get('content-type')).toContain(
        'application/problem+json'
      );
    }
    const after = await json(
      await t.call('GET', '/api/stats', { cookie: admin })
    );
    expect(after.totals).toEqual(before.totals);
    // The demo password still works.
    await t.login(VIEWER);
  });

  it('refuses every route but login, logout, health and the session check without a session', async () => {
    for (const path of ['/api/members', '/api/stats', '/api/settings']) {
      expect((await t.call('GET', path)).status, path).toBe(401);
    }
    const session = await t.call('GET', '/api/auth/session');
    expect(session.status).toBe(200);
    expect(await json(session)).toBeNull();
    for (const w of writes()) {
      expect(
        (await t.call(w.method, w.path, { body: w.body })).status,
        `${w.method} ${w.path}`
      ).toBe(401);
    }
    expect((await t.call('GET', '/api/health')).status).toBe(200);
  });

  it('lets a viewer read', async () => {
    for (const path of [
      '/api/members',
      `/api/members/${someId}`,
      '/api/stats',
      '/api/settings',
    ]) {
      expect((await t.call('GET', path, { cookie: viewer })).status, path).toBe(
        200
      );
    }
    const me = await json(
      await t.call('GET', '/api/auth/session', { cookie: viewer })
    );
    expect(me).toMatchObject({
      email: VIEWER.email,
      role: 'viewer',
      demo: true,
    });
  });

  it('lets an admin write, archiving instead of deleting', async () => {
    const created = await t.call('POST', '/api/members', {
      body: member,
      cookie: admin,
    });
    expect(created.status).toBe(201);
    const { id } = await json(created);
    const dup = await t.call('POST', '/api/members', {
      body: { ...member, email: 'TEST.person@example.com ' },
      cookie: admin,
    });
    expect(dup.status).toBe(409);
    expect((await json(dup)).errors[0].path).toBe('email');
    expect(
      (
        await t.call('PUT', `/api/members/${id}`, {
          body: { ...member, role: 'admin' },
          cookie: admin,
        })
      ).status
    ).toBe(200);
    expect(
      (await t.call('DELETE', `/api/members/${id}`, { cookie: admin })).status
    ).toBe(204);
    expect(
      (await t.call('GET', `/api/members/${id}`, { cookie: admin })).status
    ).toBe(404);
    const rows = await t.client.query<{ archived: boolean }>(
      `select archived_at is not null as archived from member where id = $1`,
      [id]
    );
    expect(rows.rows[0].archived).toBe(true);
    expect(
      (await t.call('PUT', '/api/settings', { body: settings, cookie: admin }))
        .status
    ).toBe(200);
  });

  it('refuses writes from another origin or without one, even for an admin', async () => {
    for (const origin of ['https://evil.example', null]) {
      const res = await t.call('POST', '/api/members', {
        body: { ...member, email: 'x@example.com' },
        cookie: admin,
        origin,
      });
      expect(res.status).toBe(403);
    }
  });

  it('answers invalid input with field messages, never a stack trace', async () => {
    const res = await t.call('POST', '/api/members', {
      body: { name: 'A', email: 'nope', role: 'boss' },
      cookie: admin,
    });
    expect(res.status).toBe(422);
    const body = await json(res);
    expect(body.errors.map((e: { path: string }) => e.path).sort()).toEqual([
      'email',
      'name',
      'role',
      'status',
    ]);
    expect(JSON.stringify(body)).not.toMatch(/at .*\.ts/);
    const query = await t.call('GET', '/api/members?size=999', {
      cookie: admin,
    });
    expect(query.status).toBe(422);
  });

  it('sends security headers', async () => {
    const res = await t.call('GET', '/api/health');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toContain(
      "default-src 'none'"
    );
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
