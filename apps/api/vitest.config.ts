import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    alias: {
      '@dashboard/models': new URL(
        '../../libs/models/src/index.ts',
        import.meta.url
      ).pathname,
    },
  },
  test: {
    name: 'api',
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Each file builds its own in-memory Postgres; give the WASM start-up time.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
