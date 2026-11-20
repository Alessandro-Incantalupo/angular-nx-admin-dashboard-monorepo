import { sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  accountRoles,
  languages,
  memberRoles,
  memberStatuses,
  weekStarts,
} from '@dashboard/models';

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Login accounts. The four tables Better Auth needs, with its field names.
// ---------------------------------------------------------------------------

export const accountRole = pgEnum('account_role', accountRoles);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: accountRole('role').notNull().default('viewer'),
  /** The public demo account: read-only, and its password can't be changed. */
  demo: boolean('demo').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Better Auth fills these when it can; IP tracking is turned off in auth.ts.
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  t => [index('session_user_id_idx').on(t.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  t => [index('account_user_id_idx').on(t.userId)]
);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Failed logins and failed password changes, counted for the throttle.
 * `key` is an HMAC of the email, the account id or the client IP: never the
 * value itself. Rows older than a day are deleted as new ones come in.
 */
export const loginFailure = pgTable(
  'login_failure',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    key: text('key').notNull(),
    createdAt: createdAt(),
  },
  t => [index('login_failure_key_created_idx').on(t.key, t.createdAt)]
);

// ---------------------------------------------------------------------------
// The demo workspace: what the dashboard shows and admins edit.
// ---------------------------------------------------------------------------

export const memberRole = pgEnum('member_role', memberRoles);
export const memberStatus = pgEnum('member_status', memberStatuses);

export const member = pgTable(
  'member',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: memberRole('role').notNull(),
    status: memberStatus('status').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    /** Members are archived, never deleted. Archived rows leave every list and chart. */
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  t => [
    index('member_created_idx').on(t.createdAt),
    // One live member per email; an archived member doesn't block a new one.
    uniqueIndex('member_email_live_idx')
      .on(t.email)
      .where(sql`${t.archivedAt} is null`),
  ]
);

export const activityKinds = [
  'member.created',
  'member.updated',
  'member.archived',
  'member.signed_in',
  'settings.updated',
] as const;

/** What happened in the workspace, one row per event. Feeds the activity chart. */
export const activity = pgTable(
  'activity',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    kind: text('kind', { enum: activityKinds }).notNull(),
    memberId: uuid('member_id').references(() => member.id),
    /** The login account that made the change, if any. */
    actorId: text('actor_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAt(),
  },
  t => [index('activity_created_idx').on(t.createdAt)]
);

export const language = pgEnum('language', languages);
export const weekStart = pgEnum('week_start', weekStarts);

/** A single row (id 1) with the workspace settings. */
export const workspaceSettings = pgTable('workspace_settings', {
  id: smallint('id').primaryKey().default(1),
  workspaceName: text('workspace_name').notNull(),
  supportEmail: text('support_email').notNull(),
  defaultLanguage: language('default_language').notNull().default('en'),
  weekStartsOn: weekStart('week_starts_on').notNull().default('monday'),
  updatedAt: updatedAt(),
  updatedBy: text('updated_by').references(() => user.id, {
    onDelete: 'set null',
  }),
});
