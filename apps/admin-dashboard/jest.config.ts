import type { Config } from 'jest';

// List of ES modules that need to be transformed by Jest.
// These libraries are shipped with modern JavaScript (e.g., ES modules or uncompiled code)
// and need to be processed to work in Jest's Node.js environment.
const esModules = ['@angular', '@jsverse/transloco'];

export default {
  // Display name for the Jest project. Useful when running multiple Jest projects in a monorepo.
  displayName: 'admin-dashboard',

  // Path to the Jest preset configuration. This is typically used to share common Jest settings
  // across multiple projects in a monorepo.
  preset: '../../jest.preset.js',

  // Specifies a list of files that will be executed after the test environment is set up.
  // These files are typically used to configure global settings or mock certain modules.
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

  // Directory where Jest will output coverage reports.
  // This ensures that coverage data is stored in a consistent location for this project.
  coverageDirectory: '../../coverage/apps/admin-dashboard',

  // !!Needs to be put in project JSON to work properly
  // collectCoverage: true,

  // Enables code coverage collection. Jest will instrument the code to collect coverage data.
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts', // Include all TypeScript files in the src folder
    '!<rootDir>/src/**/*.spec.ts', // Exclude test files
    '!<rootDir>/src/environments/**', // Exclude environment files
    '!<rootDir>/src/main.ts', // Exclude main entry point
    '!<rootDir>/src/polyfills.ts', // Exclude polyfills
  ],

  // Specifies the format of the coverage reports. Multiple formats can be used simultaneously.
  // - `text-summary`: Outputs a summary of coverage in the terminal.
  // - `lcov`: Generates an HTML report viewable in a browser.
  // - `html`: Another detailed HTML report format.
  coverageReporters: ['text-summary', 'lcov', 'html'],

  // Specifies how Jest should transform files before running tests.
  // This is necessary for handling TypeScript, HTML, and modern JavaScript features.
  transform: {
    // Matches files with `.ts`, `.mjs`, `.js`, or `.html` extensions.
    '^.+\\.(ts|mjs|js|html)$': [
      // Uses `jest-preset-angular` to transform Angular-specific files.
      'jest-preset-angular',
      {
        // Specifies the TypeScript configuration file to use for the transformation.
        tsconfig: '<rootDir>/tsconfig.spec.json',

        // Ensures that HTML and SVG files are stringified during the transformation process.
        // This is useful for testing components that include inline templates or SVGs.
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },

  // Specifies which files in `node_modules` should be ignored or transformed.
  // By default, Jest ignores all files in `node_modules` for performance reasons.
  // However, some libraries (e.g., ES modules or uncompiled code) need to be transformed.
  transformIgnorePatterns: [
    // Ignore all files in `node_modules`, except:
    // - `.mjs` files (modern JavaScript modules).
    // - Libraries listed in the `esModules` array.
    `node_modules/(?!.*\\.mjs$|${esModules.join('|')})`,
  ],

  // Maps module paths to specific directories or files.
  // This is useful for creating aliases for cleaner imports in tests.
  moduleNameMapper: {
    // Maps module import paths to specific directories or files.
    // The syntax uses a regular expression (e.g., `^@core/(.*)$`) to match import paths.
    // - `^@core/(.*)$`: Matches any import starting with `@core/` and captures the rest of the path (e.g., `@core/services/my-service`).
    // - `<rootDir>/src/app/core/$1`: Replaces the matched path with the specified directory, where `$1` is the captured part of the path (e.g., `services/my-service`).
    // This allows cleaner imports in tests by using aliases instead of relative paths.
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@layout/(.*)$': '<rootDir>/src/app/layout/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
  },

  // Specifies serializers for snapshot testing.
  // These serializers are used to format Angular-specific snapshots in a readable way.
  snapshotSerializers: [
    // Removes Angular-specific attributes from snapshots.
    'jest-preset-angular/build/serializers/no-ng-attributes',

    // Formats Angular component snapshots in a readable way.
    'jest-preset-angular/build/serializers/ng-snapshot',

    // Handles HTML comments in snapshots.
    'jest-preset-angular/build/serializers/html-comment',
  ],

  // Suppresses Jest's console output during test runs.
  // This is useful for reducing noise in the terminal.
  silent: true,

  // Specifies the patterns Jest uses to detect test files.
  // This configuration matches files with `.spec` or `.test` in their names and `.ts`, `.js`, or `.tsx` extensions.
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
} satisfies Config; // Ensures type safety by validating the configuration against Jest's `Config` type.
