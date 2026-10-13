# AGENTS.md

Take-home task: a minimal two-screen app (job list + job details with Favourites) on top of the public Coople jobs API.

The full task description is in `TASK.md` (local only, gitignored) — read it before making changes.

## Docs

Findings and decisions for agents live in `docs/`:

- `docs/architecture.md` — the approved architecture: stack, folder structure, entities, API layer, stores, routes, screen states and build order. Read it before writing code.
- `docs/api-cors.md` — the Coople API sends no CORS headers; browser calls from `localhost` fail, so a proxy is required.

## Stack

- Web app: Vite + React + TypeScript (strict)
- shadcn/ui + Tailwind v4
- TanStack Query (server state), zustand `persist` (client state), TanStack Router (file-based)
- zod for schemas; types are inferred from them
- Vitest

## Conventions

- Keep it small: no polished UI, focus on correct data handling, error states, clear structure and consistent naming.
- Handle loading, error and empty states for every request.
- Commit messages: English, Conventional Commits.
- Keep `README.md` up to date (setup steps + architecture notes).
