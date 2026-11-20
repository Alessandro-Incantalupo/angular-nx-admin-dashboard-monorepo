import { Hono } from 'hono';
import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';
import type {
  DashboardStats,
  MemberRole,
  MemberStatus,
} from '@dashboard/models';
import { memberRoles, memberStatuses } from '@dashboard/models';
import type { AppEnv, Deps } from '../context';
import { activity, member } from '../db/schema';

const DAY = 86_400_000;

/** `YYYY-MM` for each of the last `n` months, oldest first (UTC). */
export function lastMonths(n: number, now = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1)
    );
    return d.toISOString().slice(0, 7);
  });
}

/** `YYYY-MM-DD` for each of the last `n` days, oldest first (UTC). */
export function lastDays(n: number, now = new Date()): string[] {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return Array.from({ length: n }, (_, i) =>
    new Date(today - (n - 1 - i) * DAY).toISOString().slice(0, 10)
  );
}

export function statsRoutes({ db }: Deps) {
  return new Hono<AppEnv>().get('/', async c => {
    const live = isNull(member.archivedAt);
    const months = lastMonths(12);
    const days = lastDays(30);
    const since30 = new Date(`${days[0]}T00:00:00Z`);
    const since12m = new Date(`${months[0]}-01T00:00:00Z`);
    const month = sql<string>`to_char(${member.createdAt} at time zone 'UTC', 'YYYY-MM')`;
    const day = sql<string>`to_char(${activity.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;

    const [byRole, byStatus, byMonth, byDay, [totals], [signups], [events]] =
      await Promise.all([
        db
          .select({ key: member.role, n: count() })
          .from(member)
          .where(live)
          .groupBy(member.role),
        db
          .select({ key: member.status, n: count() })
          .from(member)
          .where(live)
          .groupBy(member.status),
        db
          .select({ key: month, n: count() })
          .from(member)
          .where(and(live, gte(member.createdAt, since12m)))
          .groupBy(month),
        db
          .select({ key: day, n: count() })
          .from(activity)
          .where(gte(activity.createdAt, since30))
          .groupBy(day),
        db
          .select({
            all: count(),
            active:
              sql<number>`count(*) filter (where ${eq(member.status, 'active')})`.mapWith(
                Number
              ),
          })
          .from(member)
          .where(live),
        db
          .select({ n: count() })
          .from(member)
          .where(and(live, gte(member.createdAt, since30))),
        db
          .select({ n: count() })
          .from(activity)
          .where(gte(activity.createdAt, since30)),
      ]);

    const lookup = <K extends string>(rows: { key: K; n: number }[]) =>
      new Map(rows.map(r => [r.key, r.n]));
    const roles = lookup(byRole);
    const statuses = lookup(byStatus);
    const perMonth = lookup(byMonth);
    const perDay = lookup(byDay);

    const stats: DashboardStats = {
      totals: {
        members: totals.all,
        active: totals.active,
        signupsLast30Days: signups.n,
        eventsLast30Days: events.n,
      },
      membersByRole: memberRoles.map((role: MemberRole) => ({
        role,
        count: roles.get(role) ?? 0,
      })),
      membersByStatus: memberStatuses.map((status: MemberStatus) => ({
        status,
        count: statuses.get(status) ?? 0,
      })),
      signupsByMonth: months.map(m => ({
        month: m,
        count: perMonth.get(m) ?? 0,
      })),
      activityByDay: days.map(d => ({ day: d, count: perDay.get(d) ?? 0 })),
    };
    return c.json(stats);
  });
}
