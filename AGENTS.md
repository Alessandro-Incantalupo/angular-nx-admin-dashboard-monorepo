# AGENTS.md

Nx monorepo: an Angular admin dashboard (`apps/admin-dashboard`), a Hono API on Postgres (`apps/api`), shared Zod schemas (`libs/models`) and a PrimeNG preset on design tokens (`libs/design-system`). The README explains what it does and how to run it.

## Before you call a change done

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
node tools/check-csp.mjs   # after changing the inline script in index.html
```

Run tasks through Nx (`pnpm exec nx run <project>:<target>`). Node and pnpm versions come from `mise.toml`.

## Rules

**Data and validation**

- A form's rules live in one Zod schema in `libs/models`. The API validates the request with it (`validate()` in `apps/api/src/lib/validate.ts`), the Angular form runs it with `validateStandardSchema`. Don't add a rule in only one place.
- Browser code imports schemas only in lazy routes. Import types with `import type`, and `isProblem` from `@dashboard/models/problem`, so Zod stays out of the first load.
- Schema changes: edit `apps/api/src/db/schema.ts`, run `pnpm db:generate`, read the SQL, then `pnpm db:migrate`. Never `drizzle-kit push`.
- Members are archived (`archived_at`), never deleted, and every change writes an `activity` row.

**API**

- Who may call a route is decided in one place: `access()` in `apps/api/src/lib/access.ts`. Writes are admin-only unless listed there. A new write route must also be added to `writes()` in `apps/api/test/access.test.ts` (the test fails until it is).
- Login, logout and password change call `auth.api.*`. Better Auth's own HTTP handler stays unmounted.
- Errors go out through `problem()` as `application/problem+json`. Logs never contain request bodies, query strings, emails or IPs.
- Configuration comes from `apps/api/src/env.ts`; add new variables there and to `.env.example`.

**Front end**

- Zoneless and signal-based: `input()`, `output()`, `computed`, `linkedSignal`, `httpResource`, OnPush everywhere. No `@Input`, no `NgModule`, no `subscribe` where a signal will do.
- Forms are Signal Forms (`@angular/forms/signals`). Each input has a `<label>`, `aria-describedby` pointing at its `<app-field-errors>`, and `[attr.aria-invalid]="showErrors(field)"`.
- Colours, radii and fonts come from token roles (`bg-surface`, `text-muted`, `var(--accent)`...), never raw colours. PrimeNG is styled through `libs/design-system/src/lib/primeng-preset.ts`.
- Route guards are for the UI only; the API enforces access.
- PrimeNG, its theme and Chart.js load with the signed-in routes (`layout/signed-in.routes.ts`); keep the login page free of them.
- Copy is short and plain English. Text is at least 16px, targets at least 44px.

## Deploys

Only from `main`: Vercel builds the front end through its Git integration, `.github/workflows/deploy.yml` migrates and ships the API. Never deploy to production from a branch.
