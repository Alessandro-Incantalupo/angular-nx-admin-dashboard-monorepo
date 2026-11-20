// Fills the database with the made-up demo workspace, or puts it back.
//   MIGRATION_DATABASE_URL=... BETTER_AUTH_SECRET=... FRONTEND_ORIGIN=... \
//   SEED_ADMIN_PASSWORD=... pnpm db:seed
// Runs as the owner (it truncates the demo tables). The deploy runs it after the
// migrations, so the public demo is reset on every deploy.
import { connect } from '../src/db/client';
import { DEMO_ACCOUNT, resetDemo } from '../src/db/seed';
import { hostOf, requireUrl } from './shared';

const url = requireUrl('MIGRATION_DATABASE_URL');
const secret = process.env['BETTER_AUTH_SECRET'];
const origin = (process.env['FRONTEND_ORIGIN'] ?? '').split(',')[0]?.trim();
if (!secret || secret.length < 32 || !origin) {
  console.error(
    'BETTER_AUTH_SECRET (32+ characters) and FRONTEND_ORIGIN must be set.'
  );
  process.exit(1);
}
const adminPassword = process.env['SEED_ADMIN_PASSWORD'];
if (adminPassword !== undefined && adminPassword.length < 12) {
  console.error('SEED_ADMIN_PASSWORD needs 12 characters or more.');
  process.exit(1);
}

const { db, close } = connect(url, 1);
try {
  const n = await resetDemo(db, { secret, baseURL: origin, adminPassword });
  console.log(
    `${hostOf(url)}: demo workspace reset, ${n.members} members and ${n.events} events.`
  );
  console.log(`Demo login: ${DEMO_ACCOUNT.email} (password in the README).`);
  if (!adminPassword)
    console.log(
      'No SEED_ADMIN_PASSWORD: admin@example.com left as it was (or not created).'
    );
} finally {
  await close();
}
