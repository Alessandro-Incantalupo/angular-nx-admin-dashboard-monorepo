import type { MemberRole, MemberStatus } from './member';

/** GET /api/stats: everything the dashboard charts. */
export interface DashboardStats {
  totals: {
    members: number;
    active: number;
    signupsLast30Days: number;
    eventsLast30Days: number;
  };
  membersByRole: { role: MemberRole; count: number }[];
  membersByStatus: { status: MemberStatus; count: number }[];
  /** The last 12 months, oldest first, `YYYY-MM`. */
  signupsByMonth: { month: string; count: number }[];
  /** The last 30 days, oldest first, `YYYY-MM-DD`. */
  activityByDay: { day: string; count: number }[];
}
