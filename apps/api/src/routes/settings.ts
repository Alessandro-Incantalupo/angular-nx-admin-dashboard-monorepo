import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import {
  workspaceSettingsSchema,
  type WorkspaceSettings,
} from '@dashboard/models';
import type { AppEnv, Deps } from '../context';
import { activity, workspaceSettings } from '../db/schema';
import { signedIn } from '../lib/access';
import { validate } from '../lib/validate';

const DEFAULTS: WorkspaceSettings = {
  workspaceName: 'Demo workspace',
  supportEmail: 'support@example.com',
  defaultLanguage: 'en',
  weekStartsOn: 'monday',
};

const columns = {
  workspaceName: workspaceSettings.workspaceName,
  supportEmail: workspaceSettings.supportEmail,
  defaultLanguage: workspaceSettings.defaultLanguage,
  weekStartsOn: workspaceSettings.weekStartsOn,
};

export function settingsRoutes({ db }: Deps) {
  return new Hono<AppEnv>()
    .get('/', async c => {
      const [row] = await db
        .select(columns)
        .from(workspaceSettings)
        .where(eq(workspaceSettings.id, 1));
      return c.json(row ?? DEFAULTS);
    })
    .put('/', validate('json', workspaceSettingsSchema), async c => {
      const input = c.req.valid('json');
      const by = signedIn(c).id;
      const saved = await db.transaction(async tx => {
        const [row] = await tx
          .insert(workspaceSettings)
          .values({ id: 1, ...input, updatedBy: by })
          .onConflictDoUpdate({
            target: workspaceSettings.id,
            set: { ...input, updatedBy: by },
          })
          .returning(columns);
        await tx
          .insert(activity)
          .values({ kind: 'settings.updated', actorId: by });
        return row;
      });
      return c.json(saved);
    });
}
