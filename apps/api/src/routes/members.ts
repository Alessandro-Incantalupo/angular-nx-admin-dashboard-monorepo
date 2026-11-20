import { Hono } from 'hono';
import { and, count, desc, eq, ilike, isNull, or, type SQL } from 'drizzle-orm';
import {
  memberIdSchema,
  memberInputSchema,
  memberListQuerySchema,
  type Member,
  type Page,
} from '@dashboard/models';
import type { AppEnv, Deps } from '../context';
import { activity, member } from '../db/schema';
import { isUniqueViolation } from '../lib/db-errors';
import { signedIn } from '../lib/access';
import { problem } from '../lib/problem';
import { validate } from '../lib/validate';

const columns = {
  id: member.id,
  name: member.name,
  email: member.email,
  role: member.role,
  status: member.status,
  createdAt: member.createdAt,
};

const toMember = (
  row: { createdAt: Date } & Omit<Member, 'createdAt'>
): Member => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
});

/** `%` and `_` typed in the search box are literal characters, not wildcards. */
const likeEscape = (s: string) => s.replace(/[\\%_]/g, m => `\\${m}`);

const emailTaken = {
  errors: [
    { path: 'email', message: 'A member with this email already exists' },
  ],
};

export function memberRoutes({ db }: Deps) {
  const live = isNull(member.archivedAt);

  return (
    new Hono<AppEnv>()
      .get('/', validate('query', memberListQuerySchema), async c => {
        const q = c.req.valid('query');
        const filters: SQL[] = [live];
        if (q.role) filters.push(eq(member.role, q.role));
        if (q.status) filters.push(eq(member.status, q.status));
        if (q.search) {
          const term = `%${likeEscape(q.search)}%`;
          filters.push(
            or(ilike(member.name, term), ilike(member.email, term)) as SQL
          );
        }
        const where = and(...filters);
        const [rows, [{ total }]] = await Promise.all([
          db
            .select(columns)
            .from(member)
            .where(where)
            .orderBy(desc(member.createdAt), member.id)
            .limit(q.size)
            .offset((q.page - 1) * q.size),
          db.select({ total: count() }).from(member).where(where),
        ]);
        const page: Page<Member> = {
          items: rows.map(toMember),
          total,
          page: q.page,
          size: q.size,
        };
        return c.json(page);
      })

      .get('/:id', validate('param', memberIdSchema), async c => {
        const { id } = c.req.valid('param');
        const [row] = await db
          .select(columns)
          .from(member)
          .where(and(eq(member.id, id), live));
        return row ? c.json(toMember(row)) : problem(c, 404);
      })

      .post('/', validate('json', memberInputSchema), async c => {
        const input = c.req.valid('json');
        try {
          const row = await db.transaction(async tx => {
            const [created] = await tx
              .insert(member)
              .values(input)
              .returning(columns);
            await tx.insert(activity).values({
              kind: 'member.created',
              memberId: created.id,
              actorId: signedIn(c).id,
            });
            return created;
          });
          return c.json(toMember(row), 201);
        } catch (err) {
          if (isUniqueViolation(err)) return problem(c, 409, emailTaken);
          throw err;
        }
      })

      .put(
        '/:id',
        validate('param', memberIdSchema),
        validate('json', memberInputSchema),
        async c => {
          const { id } = c.req.valid('param');
          const input = c.req.valid('json');
          try {
            const row = await db.transaction(async tx => {
              const [updated] = await tx
                .update(member)
                .set(input)
                .where(and(eq(member.id, id), live))
                .returning(columns);
              if (updated) {
                await tx.insert(activity).values({
                  kind: 'member.updated',
                  memberId: id,
                  actorId: signedIn(c).id,
                });
              }
              return updated;
            });
            return row ? c.json(toMember(row)) : problem(c, 404);
          } catch (err) {
            if (isUniqueViolation(err)) return problem(c, 409, emailTaken);
            throw err;
          }
        }
      )

      // Members are archived, never deleted: the row and its history stay.
      .delete('/:id', validate('param', memberIdSchema), async c => {
        const { id } = c.req.valid('param');
        const archived = await db.transaction(async tx => {
          const [row] = await tx
            .update(member)
            .set({ archivedAt: new Date(), status: 'inactive' })
            .where(and(eq(member.id, id), live))
            .returning({ id: member.id });
          if (row) {
            await tx.insert(activity).values({
              kind: 'member.archived',
              memberId: id,
              actorId: signedIn(c).id,
            });
          }
          return row;
        });
        return archived ? c.body(null, 204) : problem(c, 404);
      })
  );
}
