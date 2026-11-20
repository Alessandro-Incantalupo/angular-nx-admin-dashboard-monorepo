// Applies the SQL migrations in apps/api/drizzle as the database owner.
//   MIGRATION_DATABASE_URL=postgres://owner@host/db pnpm db:migrate
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { connect } from '../src/db/client';
import { requireUrl } from './shared';

const { db, close } = connect(requireUrl('MIGRATION_DATABASE_URL'), 1);
try {
  await migrate(db as Parameters<typeof migrate>[0], {
    migrationsFolder: new URL('../drizzle', import.meta.url).pathname,
  });
  console.log('Migrations applied.');
} finally {
  await close();
}
