import { defineConfig } from 'drizzle-kit';

// `generate` only reads the schema. Migrations are applied by scripts/migrate.ts
// with the owner role (MIGRATION_DATABASE_URL); never with `drizzle-kit push`.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  casing: 'snake_case',
});
