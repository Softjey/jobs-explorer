# Quality gates

Approved: 2026-10-13. These checks exist so that work done by agents is verified by tools, not by trust. Update this file when a check is added or removed.

## 1. Commands

Every check has its own script, and `check` runs the fast ones together.

| Script                  | Runs                                                      | Notes                                   |
| ----------------------- | --------------------------------------------------------- | --------------------------------------- |
| `npm run typecheck`     | `tsc --noEmit`                                            | strict + `noUncheckedIndexedAccess`     |
| `npm run lint`          | ESLint                                                    | see section 2                           |
| `npm run format`        | Prettier `--write`                                        | fixes files                             |
| `npm run format:check`  | Prettier `--check`                                        | used by `check` and CI                  |
| `npm run knip`          | knip                                                      | unused files, exports and dependencies  |
| `npm run test`          | Vitest, single run                                        | unit and component tests                |
| `npm run test:watch`    | Vitest, watch mode                                        | for the TDD loop                        |
| `npm run test:coverage` | Vitest with coverage                                      | fails below the thresholds in section 3 |
| `npm run test:e2e`      | Playwright                                                | builds and serves the app itself        |
| `npm run build`         | `tsc -b && vite build`                                    |                                         |
| `npm run check`         | typecheck, lint, format:check, knip, test:coverage, build | everything except e2e                   |

- **During work:** run the single test file you are changing (`npx vitest run path/to/file.test.ts`).
- **Before finishing a step:** run `npm run check`. Do not report a step as done while it fails.
- **After changing a user flow:** also run `npm run test:e2e`.

There are no git hooks and no Claude Code hooks. Both were rejected because they slow development down. CI is the enforcement point.

## 2. Static checks

| Check            | Tool                                                                  | What it catches                                                        |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Types            | `tsc`, strict + `noUncheckedIndexedAccess`                            | `any`, unhandled `undefined`, drift from entity types                  |
| Lint             | ESLint with `typescript-eslint` strict-type-checked and `react-hooks` | floating promises, wrong hook dependencies, `any`                      |
| Library lint     | `@tanstack/eslint-plugin-query`, `@tanstack/eslint-plugin-router`     | incomplete query keys, wrong route option order                        |
| Layer boundaries | `eslint-plugin-boundaries`                                            | imports against `routes → pages → components → store → api → entities` |
| Format           | Prettier                                                              | noise in diffs                                                         |
| Dead code        | knip                                                                  | unused files, exports and dependencies                                 |
| Build            | `vite build`                                                          | errors `tsc` misses, such as the generated route tree                  |

Layer boundary rules, taken from `architecture.md`:

- A layer may import only from layers to its right in the chain, plus `lib/`.
- `components/` and `pages/` must not import `api/`. They read data through `store/`.
- `entities/` imports nothing from the app.
- `components/ui/` (shadcn, generated) is excluded from lint rules that the generated code does not meet.

## 3. Tests

| Level     | Tools                                    | Scope                                                                                                                         |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Unit      | Vitest                                   | `HttpClient` (envelope, the three `ApiError` kinds), zod schemas against real fixtures, favourites store, formatters          |
| Component | Vitest + Testing Library + MSW           | every state of every page: skeleton, error + Retry, empty, not-found; favourite toggle; infinite scroll loading the next page |
| E2E       | Playwright, API mocked with `page.route` | the three flows below                                                                                                         |

E2E flows:

1. Open the list, open a job, see its details.
2. Mark a job as favourite, open `/favourites`, reload the page, the job is still there; un-mark it.
3. Open `/job/:id` directly with a valid id, an unknown id (404) and a non-UUID id.

Coverage:

- **Thresholds:** 90% lines and branches for `src/api/`, `src/store/`, `src/entities/` and `src/lib/`.
- **No global threshold:** pages and components are covered by component tests, but a number is not enforced there.
- **Excluded:** `src/components/ui/`, `src/routes/`, `routeTree.gen.ts`, `main.tsx`.

File layout:

- **Unit and component tests:** next to the source file, `*.test.ts` or `*.test.tsx`.
- **Shared test code:** `src/test/` holds the Vitest setup, MSW handlers and fixtures.
- **Fixtures:** real responses saved from the Coople API (a list page, a details object, the 404 body, the 401 body).
- **E2E tests:** `e2e/` at the repo root.

Tests never call the real Coople API. A live contract test and visual regression were considered and left out.

## 4. CI

GitHub Actions, on every push and pull request. Independent checks run as parallel jobs so that one failure does not hide another.

| Job         | Command                                                      | Depends on |
| ----------- | ------------------------------------------------------------ | ---------- |
| `typecheck` | `npm run typecheck`                                          | —          |
| `lint`      | `npm run lint`                                               | —          |
| `format`    | `npm run format:check`                                       | —          |
| `knip`      | `npm run knip`                                               | —          |
| `test`      | `npm run test:coverage`                                      | —          |
| `build`     | `npm run build`, uploads `dist`                              | —          |
| `e2e`       | `npm run test:e2e`, uploads the Playwright report on failure | —          |
| `docker`    | `docker build .`                                             | —          |

- **Setup:** each job runs `npm ci` with the npm cache from `actions/setup-node`.
- **Concurrency:** a new push to the same branch cancels the running workflow.

## 5. CD

Target: Railway, one service built from the repo `Dockerfile`.

- **Why Railway:** the app needs a same-origin proxy for `/api` (see `api-cors.md`), which a static host such as GitHub Pages cannot provide. On Railway the container serves the static build and proxies `/api` itself.
- **Trigger:** manual only. The `Deploy` workflow (`.github/workflows/deploy.yml`) runs on `workflow_dispatch` and is never started by CI or a push. It deploys the selected ref to service `jobs-explorer`, environment `production`, with the Railway CLI and a project token stored in the `RAILWAY_TOKEN` repository secret. It does not wait for CI, so check that CI is green on the ref first.
- **Same image everywhere:** `docker compose up` locally and the Railway service run the same `Dockerfile`, so the deployed behaviour can be reproduced on a laptop.
- **Smoke check after deploy:** the public URL returns the app, `/api/work-assignments/public-jobs/list?pageNum=0&pageSize=1` returns `200`, and `/job/<id>` opened directly returns the app, not a 404.

The container itself is described in `architecture.md`, section 8.
