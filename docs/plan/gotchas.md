# Gotchas

## `nx build admin-dashboard` fails with "Package subpath './node/index' is not defined by exports" (2026-11-26) · `stack:toolchain/gotcha/pnpm-hoist-differs-after-incremental-install`

Nx's Angular adapter loads `@angular-devkit/architect/node/index` from pnpm's hoisted folder (`node_modules/.pnpm/node_modules`). Two versions are in the lockfile: 0.2202.8 (no `exports` map, the path works) and 0.2203.0 (`exports` without `./node/index`, the path fails). Which one gets hoisted depends on what was already in `node_modules`: after adding Hashbrown, an install on top of the old `node_modules` hoisted 0.2203.0 and the build failed; a clean install from the same lockfile hoisted 0.2202.8 and built.

Fix: `rm -rf node_modules && pnpm install --frozen-lockfile`. CI and Docker always install clean, so they aren't affected. Check with `readlink -f node_modules/.pnpm/node_modules/@angular-devkit/architect`.

## The model writes the tool call as JSON text instead of calling the tool (2026-11-26)

With Ollama, Hashbrown's adapter sends both `tools` and `format` (the UI schema) when `forwardedProps.hashbrown.responseSchema` is set. `format` constrains every token to the schema, so `gemma4:12b` never makes a real tool call: it writes `{"ui":[{"type":"tool_call","tool":"listUsers",...}]}` or invents an answer. The same request without `format` calls `listUsers` with the right arguments. Hashbrown's Ollama page reports the same thing ("Schema-plus-tools cases omitted required lookups").

Fix: `apps/api/src/ai/two-phase.ts`. Right after a user message, run without the schema (tools only); if the model called a tool, pass that run on; otherwise drop it and run with the schema. After the tool result, run with the schema.

## `max-w-md` is 1 rem wide, and `text-color-foreground` does nothing (2026-11-26)

The design system defines `--spacing-xs` to `--spacing-3xl` (0.5 to 4 rem). Tailwind 4 reads `max-w-md` and `max-w-3xl` from those before the container sizes, so they come out 1 rem and 4 rem: the assistant page was 64 px wide. Use explicit widths (`max-w-[48rem]`).

The app's `text-color-foreground` and `text-color-muted-foreground` (117 uses) aren't generated at all; text just inherits. The tokens are `text-foreground` and `text-muted-foreground`. The utilities come from `nx run design-system:build-styles`, which the dev server doesn't rerun: new classes need that build, then a reload.

## A wrapped Hashbrown transport never sees the end of its stream (2026-11-26)

Hashbrown stops reading a transport's `events` once the run has finished, so code after a `for await` over them never runs. The recording transport hands each run over in `finally`.

## A `@defer` block loads eagerly, or only looks lazy in dev (2026-11-26)

A `viewChild` (or `viewChildren`) query that names a component inside a `@defer` block puts that component in the parent's chunk, so the block loads with the page and the defer does nothing. The chat launcher has no query on the chat for this reason: it shows the chat with `@defer (when loaded())`.

The other way around, `nx serve` with HMR loads `@defer` chunks up front, so the dev server can't show whether a block is lazy. Check on a production build: `nx build admin-dashboard`, then look for the component's code in the initial chunks, or watch the network tab on `nx serve --configuration production`.
