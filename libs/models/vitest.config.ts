import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'models',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
