import { eq, sql } from 'drizzle-orm';
import type { MemberRole, MemberStatus } from '@dashboard/models';
import { createAuth } from '../auth';
import type { Db } from './client';
import {
  activity,
  activityKinds,
  loginFailure,
  member,
  user,
  workspaceSettings,
} from './schema';

/** The public demo login, printed in the README. Read-only, reset with the demo data. */
export const DEMO_ACCOUNT = {
  name: 'Demo Viewer',
  email: 'demo@example.com',
  password: 'look-but-dont-touch',
} as const;

const FIRST = [
  'Ada',
  'Alan',
  'Grace',
  'Linus',
  'Margaret',
  'Dennis',
  'Barbara',
  'Ken',
  'Frances',
  'Tim',
  'Radia',
  'Edsger',
  'Hedy',
  'John',
  'Katherine',
  'Niklaus',
  'Sophie',
  'Bjarne',
  'Annie',
  'Guido',
];
const LAST = [
  'Byron',
  'Turing',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Ritchie',
  'Liskov',
  'Thompson',
  'Allen',
  'Lee',
  'Perlman',
  'Dijkstra',
  'Lamarr',
  'Backus',
  'Johnson',
  'Wirth',
  'Wilson',
  'Stroustrup',
  'Easley',
  'van Rossum',
];

/** A small seeded PRNG, so every reset produces the same made-up workspace. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;

/** About 60 made-up members over 14 months, and 60 days of activity. */
export function demoData(now = new Date(), seed = 42) {
  const rnd = random(seed);
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(rnd() * items.length)];
  const roles: MemberRole[] = [
    'viewer',
    'viewer',
    'viewer',
    'editor',
    'editor',
    'admin',
  ];
  const statuses: MemberStatus[] = [
    'active',
    'active',
    'active',
    'active',
    'invited',
    'inactive',
  ];

  const members = Array.from({ length: 64 }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    // More sign-ups in recent months: the square pulls dates towards today.
    const ageDays = Math.floor(Math.pow(rnd(), 1.6) * 420);
    return {
      name: `${first} ${last}`,
      email:
        `${first}.${last}.${i}`.toLowerCase().replace(/[^a-z0-9.]/g, '') +
        '@example.com',
      role: pick(roles),
      status: pick(statuses),
      createdAt: new Date(
        now.getTime() - ageDays * DAY - Math.floor(rnd() * DAY)
      ),
    };
  });

  const events = Array.from({ length: 60 }, (_, d) => {
    const day = new Date(now.getTime() - d * DAY);
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    const n = Math.floor((weekend ? 3 : 12) + rnd() * (weekend ? 4 : 14));
    return Array.from({ length: n }, () => ({
      kind: pick(activityKinds),
      createdAt: new Date(day.getTime() - Math.floor(rnd() * DAY * 0.9)),
      memberIndex: Math.floor(rnd() * members.length),
    }));
  }).flat();

  return { members, events };
}

export interface SeedOptions {
  secret: string;
  baseURL: string;
  /** Password for admin@example.com, created if missing. Omit to skip the admin. */
  adminPassword?: string;
  now?: Date;
}

/**
 * Resets the demo workspace: members, activity, settings, failed-login
 * counts and the demo account (password and sessions). The admin account,
 * if it exists, keeps its password.
 */
export async function resetDemo(db: Db, o: SeedOptions) {
  const auth = createAuth({
    db,
    secret: o.secret,
    baseURL: o.baseURL,
    trustedOrigins: [o.baseURL],
    allowSignUp: true,
  });

  await db.execute(
    sql`truncate ${activity}, ${member}, ${loginFailure} restart identity cascade`
  );
  await db.delete(workspaceSettings);

  // The demo account is recreated, so its password is always the documented one.
  await db.delete(user).where(eq(user.email, DEMO_ACCOUNT.email));
  await auth.api.signUpEmail({ body: { ...DEMO_ACCOUNT } });
  await db
    .update(user)
    .set({ role: 'viewer', demo: true })
    .where(eq(user.email, DEMO_ACCOUNT.email));

  if (o.adminPassword) {
    const [admin] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, 'admin@example.com'));
    if (!admin) {
      await auth.api.signUpEmail({
        body: {
          name: 'Workspace Admin',
          email: 'admin@example.com',
          password: o.adminPassword,
        },
      });
    }
    await db
      .update(user)
      .set({ role: 'admin', demo: false })
      .where(eq(user.email, 'admin@example.com'));
  }

  const { members, events } = demoData(o.now);
  const ids = await db
    .insert(member)
    .values(members)
    .returning({ id: member.id });
  for (let i = 0; i < events.length; i += 500) {
    await db.insert(activity).values(
      events.slice(i, i + 500).map(e => ({
        kind: e.kind,
        createdAt: e.createdAt,
        memberId: ids[e.memberIndex].id,
      }))
    );
  }
  await db.insert(workspaceSettings).values({
    id: 1,
    workspaceName: 'Northwind Studio',
    supportEmail: 'support@example.com',
    defaultLanguage: 'en',
    weekStartsOn: 'monday',
  });
  return { members: ids.length, events: events.length };
}
