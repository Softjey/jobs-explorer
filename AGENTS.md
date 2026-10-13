# AGENTS.md

Take-home task: a minimal two-screen app (job list + job details with Favourites) on top of the public Coople jobs API.

The full task description is in `TASK.md` (local only, gitignored) — read it before making changes.

## Docs

Findings and decisions for agents live in `docs/`:

- `docs/architecture.md` — the approved architecture: stack, folder structure, entities, API layer, stores, routes, screen states and build order. Read it before writing code.
- `docs/quality.md` — quality gates: npm scripts, static checks, test levels, coverage thresholds, CI and CD (Railway).
- `docs/api-cors.md` — the Coople API sends no CORS headers; browser calls from `localhost` fail, so a proxy is required.

## Stack

- Web app: Vite + React + TypeScript (strict)
- shadcn/ui + Tailwind v4
- TanStack Query (server state), zustand `persist` (client state), TanStack Router (file-based)
- zod for schemas; types are inferred from them
- Vitest + Testing Library + MSW, Playwright
- Docker (nginx serves the build and proxies `/api`), Docker Compose locally, Railway in production

## Workflow: TDD

Write code test-first. For every behaviour change:

1. **Red:** write one failing test that describes the behaviour. Run it and confirm it fails for the expected reason.
2. **Green:** write the minimum code that makes it pass.
3. **Refactor:** clean up with the tests green.

- Applies to `entities/`, `api/`, `store/`, `lib/`, and the behaviour of `components/` and `pages/` (states, interactions).
- Does not apply to config, generated code (`components/ui/`, `routeTree.gen.ts`) and route config files in `routes/`.
- Do not change a test to make it pass unless the test itself is wrong; say so when you do.
- During the loop run only the test file you are working on: `npx vitest run path/to/file.test.ts`.
- Before reporting a step as done, run `npm run check`; after changing a user flow, also run `npm run test:e2e`. Do not finish with a failing check.

## Conventions

- Keep it small: no polished UI, focus on correct data handling, error states, clear structure and consistent naming.
- Handle loading, error and empty states for every request.
- Commit messages: English, Conventional Commits.
- Keep `README.md` up to date (setup steps + architecture notes).
