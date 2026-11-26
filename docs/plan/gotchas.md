# Gotchas

## `nx build admin-dashboard` fails with "Package subpath './node/index' is not defined by exports" (2026-11-26) · `stack:toolchain/gotcha/pnpm-hoist-differs-after-incremental-install`

Nx's Angular adapter loads `@angular-devkit/architect/node/index` from pnpm's hoisted folder (`node_modules/.pnpm/node_modules`). Two versions are in the lockfile: 0.2202.8 (no `exports` map, the path works) and 0.2203.0 (`exports` without `./node/index`, the path fails). Which one gets hoisted depends on what was already in `node_modules`: after adding Hashbrown, an install on top of the old `node_modules` hoisted 0.2203.0 and the build failed; a clean install from the same lockfile hoisted 0.2202.8 and built.

Fix: `rm -rf node_modules && pnpm install --frozen-lockfile`. CI and Docker always install clean, so they aren't affected. Check with `readlink -f node_modules/.pnpm/node_modules/@angular-devkit/architect`.
