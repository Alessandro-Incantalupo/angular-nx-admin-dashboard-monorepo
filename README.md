# Admin Dashboard NX Monorepo

A production-ready enterprise admin dashboard built with Angular 22, Nx monorepo, and NgRx Signals demonstrating the patterns I consider non-negotiable in a well-structured Angular codebase.

## AI assistant (Hashbrown)

![The chat opening from the round button in the corner, then answering "Which admins do we have?" with the user table, a count per role as text, and Bob as a user card, in the recorded demo](./docs/assistant-demo.gif)

A chat panel, opened from the round button in the bottom-right corner of every page, answers questions about the dashboard's users with [Hashbrown](https://hashbrown.dev) 0.8 on Angular 22. [Try it live](https://angular-admin-dashboard.alessandro-incantalupo.workers.dev/users?chat=open).

What happens in the GIF, for "Which admins do we have?":

1. **The question goes to the model** with two tool definitions and the schema of the components it may answer with.
2. **The model asks for a tool**, `listUsers` with role `admin` ("Looked up users: role admin" in the chat). Hashbrown runs the handler **in the browser**: it calls the dashboard's own API, with the visitor's own access.
3. **The tool result goes back to the model**, which answers with UI JSON instead of prose: `UserTable` with the ids of the three admins.
4. **Hashbrown renders that JSON as the app's own Angular components** while it streams in. The table fetches each user by id, so names, roles and statuses come from the API, not from the model.

"How many users are there per role?" works the same way with `countUsers` and a Markdown sentence, and "Show me Bob." with a `UserCard`. In the deployed demo, the model's side (steps 1 and 3) is replayed from a recording; the tool call and the components (steps 2 and 4) run live.

How it's built:

- **Tools run in the browser.** The model calls `listUsers` and `countUsers`; their handlers fetch from the app's own API, so the model never touches data the user can't see.
- **Answers use the app's components.** The model streams UI JSON that Hashbrown renders as the app's `UserTable`, `UserCard` and Markdown. The components load their records by id, so a card always shows the real data.
- **One contract.** `libs/assistant-contract` holds the system prompt, the component definitions and the tool schemas. The browser and the API build the same JSON schema from it, and the API pins its own copy.
- **Loads on first open.** The panel's chat is a `@defer` block, so Hashbrown stays out of the initial bundle until someone opens it. Closing the panel keeps the conversation.
- **Recorded demo in production.** The deployed API has no model, so the page replays conversations recorded from `gemma4:12b` on a local Ollama, through Hashbrown's own client (a replay transport). The recorded tool calls still run against the live API. The panel says it's a recorded demo, and types each picked question into the box before sending it.

Live, on your machine (needs [Ollama](https://ollama.com) with `gemma4:12b`):

```sh
AI_PROVIDER=ollama PORT=3100 bun run apps/api/src/server.ts
pnpm exec nx run design-system:build-styles
pnpm exec nx serve admin-dashboard --configuration=development --port 4300
# open http://localhost:4300/users?chat=open (add &assistant=recorded for the replay)
```

Recordings: `node tools/assistant/record-conversations.mjs` against the live stack. GIF: `node tools/assistant/capture-demo.mjs`.

## Live Demo

- **Frontend**: [angular-admin-dashboard.alessandro-incantalupo.workers.dev](https://angular-admin-dashboard.alessandro-incantalupo.workers.dev) (Cloudflare Workers)
- **Backend API**: [nx-angular-admin-vu22n.ondigitalocean.app](https://nx-angular-admin-vu22n.ondigitalocean.app/)

The frontend consumes data from the deployed backend API, both are live and connected.

## Demo

![Adding a user with reactive form validation, toast notification, signal-driven state updates, and pagination](./docs/demo.gif)

## Why I Built It

The decisions here are the ones I'd make on any production codebase:

- **Services as the network boundary**: each HTTP service is the only layer that knows the backend URL and response shape. It fetches raw data and hands it off. Components never call services directly, which means swapping environments or backends touches one file, not the whole app.
- **Signal Store as the manipulation and distribution layer**: the store transforms, filters, and derives exactly what each component needs. Components consume signals passively. The store slice per feature keeps the domain's data and derived state co-located.
- **`OnPush` + zoneless**: components opt out of zone.js and trigger re-renders only when signals change. This is where Angular's roadmap is pointing; writing it this way now makes the eventual migration trivial.
- **`core/`, `features/`, `shared/` folder convention with lazy loading**: `core/` holds singleton services and interceptors loaded once at startup. `features/` groups each domain (users, auth, settings) into its own lazy route chunk with its own store and service. `shared/` contains reusable components and utilities with no domain knowledge.

---

## Key Highlights

- Angular 21 with standalone components and signal-based state management
- Nx Monorepo architecture with shared libraries and dependency management
- Full-stack implementation with REST API backend and frontend consuming it
- Enterprise-grade patterns: CRUD operations, user management, role-based features
- CI/CD: GitHub Actions + Docker + DigitalOcean App Platform (backend), Cloudflare Workers (frontend)

## What This Demonstrates

| Pattern                                                                                | Where                                                                   |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| HTTP interceptors: global auth injection, error normalisation, response transformation | `apps/admin-dashboard/src/app/core/interceptors/`                       |
| NgRx Signal Store: per-feature state slices, computed state, effect isolation          | `apps/admin-dashboard/src/app/`                                         |
| `OnPush` change detection + zoneless signals                                           | Component files in `apps/admin-dashboard/src/app/`                      |
| Feature-based lazy loading with self-contained route chunks                            | `app.routes.ts`                                                         |
| Nx shared library boundary: compiler-enforced type safety across apps                  | `libs/models/`, `libs/app-info/`                                        |
| CI/CD: GitHub Actions + Docker build + DigitalOcean App Platform                       | `.github/workflows/`, `api/Dockerfile`                                  |
| Full-stack TypeScript: shared models between Angular and Hono.js API                   | `libs/models/` consumed in both `apps/api/` and `apps/admin-dashboard/` |
| Cloudflare Workers frontend + DigitalOcean backend (both live, CORS configured)        | Live demo links above, `wrangler.jsonc`                                 |
