# AGENTS.md

Take-home task: a minimal two-screen app (job list + job details with Favourites) on top of the public Coople jobs API.

The full task description is in `TASK.md` (local only, gitignored) — read it before making changes.

## Docs

Findings and decisions for agents live in `docs/`:

- `docs/api-cors.md` — the Coople API sends no CORS headers; browser calls from `localhost` fail, so a proxy is required.

## Stack

- TypeScript
- Web or React Native — TBD

## Conventions

- Keep it small: no polished UI, focus on correct data handling, error states, clear structure and consistent naming.
- Handle loading, error and empty states for every request.
- Commit messages: English, Conventional Commits.
- Keep `README.md` up to date (setup steps + architecture notes).
