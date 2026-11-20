// Creates or updates the role the running API connects as: `app_runtime`.
// It can read and write rows in the app's tables and nothing else: no DDL,
// no TRUNCATE, no access to the migrations table. Migrations and this script
// run as the owner (MIGRATION_DATABASE_URL).
//
//   APP_DATABASE_PASSWORD=... pnpm db:app-role          # dry run: says what it would do
//   APP_DATABASE_PASSWORD=... pnpm db:app-role --yes    # apply, then verify
//
// Safe to repeat: grants are re-applied, the password is set to the given one.
// The password goes to Postgres as a SCRAM verifier, so it never appears in a
// statement log. Then point DATABASE_URL at the same server with this role.
import { createHash, createHmac, pbkdf2Sync, randomBytes } from 'node:crypto';
import postgres from 'postgres';
import { hostOf, requireUrl } from './shared';

const ROLE = 'app_runtime';
const TABLES = [
  'user',
  'session',
  'account',
  'verification',
  'login_failure',
  'member',
  'activity',
  'workspace_settings',
];

const ownerUrl = requireUrl('MIGRATION_DATABASE_URL');
const password = process.env['APP_DATABASE_PASSWORD'] ?? '';
if (password.length < 16) {
  console.error('APP_DATABASE_PASSWORD must be set, 16 characters or more.');
  process.exit(1);
}
const apply = process.argv.includes('--yes');

function scramVerifier(pw: string): string {
  const salt = randomBytes(16);
  const iterations = 4096;
  const salted = pbkdf2Sync(pw, salt, iterations, 32, 'sha256');
  const clientKey = createHmac('sha256', salted).update('Client Key').digest();
  const storedKey = createHash('sha256').update(clientKey).digest();
  const serverKey = createHmac('sha256', salted).update('Server Key').digest();
  return `SCRAM-SHA-256$${iterations}:${salt.toString('base64')}$${storedKey.toString('base64')}:${serverKey.toString('base64')}`;
}

const q = (name: string) => `"${name.replace(/"/g, '""')}"`;
const sql = postgres(ownerUrl, {
  prepare: false,
  max: 1,
  onnotice: () => undefined,
});

try {
  const [{ owner }] = await sql<
    { owner: string }[]
  >`select current_user as owner`;
  const [exists] = await sql`select 1 from pg_roles where rolname = ${ROLE}`;
  console.log(
    `${hostOf(ownerUrl)}: role ${ROLE} ${exists ? 'exists' : 'is missing'}. ` +
      `Will ${exists ? '' : 'create it, '}set its password and grant row access on ${TABLES.length} tables.`
  );
  if (!apply) {
    console.log('Dry run. Add --yes to apply.');
  } else {
    const tables = TABLES.map(t => `public.${q(t)}`).join(', ');
    const rowRights = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].join(', ');
    await sql.begin(async tx => {
      // Neon forwards role changes to its control plane, which refuses a
      // SCRAM verifier ("Neon only supports being given plaintext passwords").
      const pw = new URL(ownerUrl).hostname.endsWith('.neon.tech')
        ? `PASSWORD '${password.replace(/'/g, "''")}'`
        : `PASSWORD '${scramVerifier(password)}'`;
      await tx.unsafe(
        exists
          ? `ALTER ROLE ${q(ROLE)} WITH LOGIN ${pw}`
          : `CREATE ROLE ${q(ROLE)} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS ${pw}`
      );
      await tx.unsafe(`GRANT USAGE ON SCHEMA public TO ${q(ROLE)}`);
      await tx.unsafe(`REVOKE CREATE ON SCHEMA public FROM ${q(ROLE)}`);
      await tx.unsafe(
        `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${q(ROLE)}`
      );
      await tx.unsafe(`GRANT ${rowRights} ON ${tables} TO ${q(ROLE)}`);
      await tx.unsafe(
        `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${q(ROLE)}`
      );
      // Tables a later migration adds (created by the owner) come with row access too.
      await tx.unsafe(
        `ALTER DEFAULT PRIVILEGES FOR ROLE ${q(owner)} IN SCHEMA public GRANT ${rowRights} ON TABLES TO ${q(ROLE)}`
      );
      await tx.unsafe(
        `ALTER DEFAULT PRIVILEGES FOR ROLE ${q(owner)} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${q(ROLE)}`
      );
    });

    // Check from the owner's side what the role can and can't do.
    const [can] = await sql<
      {
        rows: boolean;
        truncate: boolean;
        create_tables: boolean;
        powers: boolean;
        migrations: boolean;
      }[]
    >`
      select
        has_table_privilege(${ROLE}, 'public.member', 'select, insert, update') as rows,
        has_table_privilege(${ROLE}, 'public.member', 'truncate') as truncate,
        has_schema_privilege(${ROLE}, 'public', 'create') as create_tables,
        (select rolsuper or rolcreaterole or rolcreatedb or rolbypassrls
           from pg_roles where rolname = ${ROLE}) as powers,
        case when to_regnamespace('drizzle') is null then false
             else has_schema_privilege(${ROLE}, 'drizzle', 'usage') end as migrations`;
    console.table(can);
    if (
      !can.rows ||
      can.truncate ||
      can.create_tables ||
      can.powers ||
      can.migrations
    ) {
      console.error(
        'The role has a right it should not have, or lacks row access: see above.'
      );
      process.exitCode = 1;
    } else {
      console.log(`${ROLE} reads and writes rows, and can't change tables.`);
    }
  }
} finally {
  await sql.end();
}
