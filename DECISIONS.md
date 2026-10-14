# Decisions

The key decisions behind this project and the reasons for them. What was built is described in [README.md](README.md) and [docs/architecture.md](docs/architecture.md); this file explains why.

## Stack

| Decision                                           | Why                                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Query                                     | Proper caching from the start. The API sends `cache-control: no-store`, so all caching lives in Query.                                         |
| TanStack Router instead of React Router            | A take-home task is a good place to try something new, and React Router was getting old for me.                                                |
| Favourites in `localStorage` via zustand `persist` | The task names no backend, and `localStorage` is big enough for this data.                                                                     |
| Railway for deployment                             | I already have a subscription there; for a take-home task the host does not matter. GitHub Pages was ruled out because it cannot proxy `/api`. |

## Architecture

| Decision                                                                                         | Why                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API layer as resource classes (`api.jobs.getMany()`), types only from zod schemas in `entities/` | Easy to maintain and extend: a new endpoint is a new resource class, a new type is a new schema.                                                              |
| A favourite stores a snapshot of the card; details are fetched by id on open                     | The Favourites page renders without requests. Fetching every favourite by id would be N requests; this way a request happens only for the job the user opens. |
| `/favourites` is its own page, not a filter (`/?favourites=true`) on the list                    | Users open these two pages with different intentions, so they are two pages, not one.                                                                         |
| Env variables are validated with zod and a missing one throws (no `?? '/api'` fallback)          | A misconfiguration fails in CI, not silently at runtime.                                                                                                      |

## The `/api` proxy

The Coople API sends no CORS headers. I checked this in a real browser, not only with curl ([docs/api-cors.md](docs/api-cors.md)), so every environment proxies `/api`: Vite in dev and preview, nginx in Docker and on Railway.

`.env.development` and `.env.production` are committed on purpose: this is a client-side app, so every `VITE_*` value ends up in the public bundle anyway. Details are in the README.

## Working with AI agents

| Decision                                                                                                     | Why                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| TDD is mandatory for agents ([AGENTS.md](AGENTS.md))                                                         | The agent first describes the behaviour in a test and only then builds it, instead of writing tests that just cover existing code. |
| One quality gate, `npm run check`, run by the agent and by CI; no Claude Code hooks, no git pre-commit hooks | Hooks would slow development down; CI runs the same checks on every push.                                                          |
| Code reviews where every suspected problem must be reproduced before it counts                               | Several decisions rest on real data instead of guesses (see below).                                                                |

Decisions that came from checking live data:

- **Dates are shown in `Europe/Zurich`.** With UTC, some publish dates on the live API showed one day early.
- **Job names are plain text, not markdown.** The `*` in names is German gender notation (`Mitarbeiter*in`); rendering it as markdown turns it into italics.
- **`requirements` is optional.** All ~720 live jobs were run through the schemas, and one had no `requirements`.
- **Non-UUID job ids show "not found" without a request.** The API answers 401, not 404, to them.

## Left as is on purpose

These came up in review. I consider them a rabbit hole for this task; happy to discuss them.

- The error message does not depend on `ApiError.kind`: a schema error or a 5xx also says "Check your connection".
- One malformed job fails the whole list page (the page schema is all-or-nothing).
- `whitespace-pre-line` around the rendered `requirements` adds blank lines between paragraphs and list items.
- The German gender star in `requirements` (`Promotor*innen`) is rendered as italics.
- Once the list is older than `staleTime`, the `/` loader re-requests every loaded page in a row.
- A failed background refetch of the list is not shown while old jobs are on screen.
- `migrateStoredFavourites` drops all favourites on any version mismatch, including data from a newer version.
- `.dockerignore` does not exclude `.env.local`, so a local override could end up in the Docker build.

## Assumptions

- `currencyId: 1` is shown as CHF; the API has no currency dictionary.
- `workDuration` is treated as minutes.
