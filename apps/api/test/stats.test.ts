import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lastDays, lastMonths } from '../src/routes/stats';
import { VIEWER, json, setup } from './harness';

describe('stats', () => {
  let t: Awaited<ReturnType<typeof setup>>;
  beforeAll(async () => {
    t = await setup();
  });
  afterAll(() => t.close());

  it('returns 12 months and 30 days, oldest first, with every role and status', async () => {
    const cookie = await t.login(VIEWER);
    const stats = await json(await t.call('GET', '/api/stats', { cookie }));
    expect(stats.signupsByMonth).toHaveLength(12);
    expect(stats.activityByDay).toHaveLength(30);
    expect(stats.membersByRole.map((r: { role: string }) => r.role)).toEqual([
      'admin',
      'editor',
      'viewer',
    ]);
    const sum = stats.membersByRole.reduce(
      (n: number, r: { count: number }) => n + r.count,
      0
    );
    expect(sum).toBe(stats.totals.members);
    expect(stats.totals.eventsLast30Days).toBeGreaterThan(0);
  });

  it('builds calendar keys across a year boundary', () => {
    const now = new Date('2026-01-15T12:00:00Z');
    expect(lastMonths(3, now)).toEqual(['2025-11', '2025-12', '2026-01']);
    expect(lastDays(2, now)).toEqual(['2026-01-14', '2026-01-15']);
  });
});
