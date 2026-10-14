# Architecture

Approved: 2026-10-13. This is the plan the app is built against. Update it when a decision changes.

The app is frontend only. The task does not ask for a backend, and Favourites are stored in the browser. The only server-side piece is a proxy that works around CORS (see `api-cors.md`): Vite in development, nginx in the container.

## 1. Stack

| Area                 | Choice                                                        |
| -------------------- | ------------------------------------------------------------- |
| Build                | Vite + React + TypeScript (strict)                            |
| UI                   | shadcn/ui + Tailwind v4                                       |
| Server state         | TanStack Query                                                |
| Client state         | zustand + `persist` (localStorage)                            |
| Routing              | TanStack Router, file-based                                   |
| Validation and types | zod; types are inferred from schemas                          |
| Runtime and deploy   | Docker (nginx), Docker Compose locally, Railway in production |
| Tests                | Vitest + Testing Library + MSW, Playwright (see `quality.md`) |

## 2. Structure

```
src/
  entities/            domain types and zod schemas
  api/                 Api class with resources
  store/
    server/            TanStack Query
    client/            zustand
  routes/              route config only
  pages/               page components
  components/
    ui/                shadcn (generated)
    jobs/              JobCard, JobCardSkeleton, JobDetailsSkeleton, FavouriteButton
    common/            ErrorState, EmptyState
  lib/                 format.ts (Intl), utils.ts (cn)
  router.ts
  main.tsx
e2e/                   Playwright tests
Dockerfile
docker-compose.yml
nginx/default.conf.template
```

Dependencies point one way: `routes → pages → components → store → api → entities`. Components never call `fetch` or `api` directly; they go through `store/`.

## 3. Entities

Each entity has its own folder with a `*.schema.ts` (zod) and an `index.ts` that exports the type via `z.infer`. Types are not written by hand next to a schema.

```
entities/
  money/         Money
  job/           JobLocation, JobSkill, JobSummary, JobDetails, JobPreview
  favourite/     FavouriteJob
  pagination/    Paginated<T>
```

| Entity                   | Fields                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Money`                  | `amount: number`, `currencyId: number`                                                                                                                                                                            |
| `JobLocation`            | `addressStreet`, `extraAddress`, `zip`, `city: string`, `countryId: number`, `state?: string`                                                                                                                     |
| `JobSkill`               | `jobProfileId: number`, `educationalLevelId?: number`                                                                                                                                                             |
| `JobSummary` (list item) | `workAssignmentId`, `waReadableId`, `workAssignmentName`, `branchLink: string`; `hourlyWage`, `salary: Money`; `jobSkill: JobSkill`; `jobLocation: JobLocation`; `periodFrom`, `datePublished: number` (epoch ms) |
| `JobDetails`             | `JobSummary` + `requirements?: string`, `clothingRequirements?: string`, `periodTo`, `firstShiftTo`, `shiftsCount`, `workDuration: number`                                                                        |
| `JobPreview`             | `Pick<JobSummary, …>` with exactly the fields the card shows                                                                                                                                                      |
| `FavouriteJob`           | `JobPreview & { addedAt: number }`                                                                                                                                                                                |
| `Paginated<T>`           | `items: T[]`, `total: number`                                                                                                                                                                                     |

- **Optional fields:** `state`, `educationalLevelId` and `clothingRequirements` are missing in some real responses (checked on 30 list items and 7 details).
- **`JobPreview`:** `JobCard` takes this type, so the same card renders in the job list and in Favourites.
- **API envelope:** not an entity. Its type lives in `api/`.

## 4. API

```
api/
  api.ts                    class Api { jobs: JobsResource }; export const api
  http-client.ts            class HttpClient: request(path, schema)
  api-error.ts              class ApiError
  resources/
    jobs.resource.ts        class JobsResource
```

- **Calls:** `api.jobs.getMany({ pageNum, pageSize })` returns `Paginated<JobSummary>`; `api.jobs.getOne(id)` returns `JobDetails`.
- **`HttpClient`:** transport only. Requests the base URL from validated env (`VITE_API_BASE_URL`, `/api`) and returns `{ ok, status, body }`. It is passed to each resource through the constructor.
- **Envelope:** `api/envelope.ts` unwraps `{ status, data, error, errorCode, errorId }`, validates `data` with zod and throws `ApiError`. Resources call it on the `HttpClient` response.
- **`ApiError`:** has a `kind` of `network`, `http` (with `status`, `errorCode`, `errorId`) or `schema`.
- **Adding a resource:** one new class in `resources/` and one field on `Api`.

## 5. Store

```
store/
  server/
    query-client.ts         QueryClient, staleTime and retry defaults
    jobs/
      jobs.keys.ts          key factory
      jobs.queries.ts       jobsInfiniteQueryOptions, jobQueryOptions
      jobs.hooks.ts         useJobs(), useJob(id)
  client/
    storage-keys.ts         STORAGE_KEYS
    favourites/
      favourites.operations.ts   pure add/remove/sort
      favourites.persistence.ts  storage name, version, validation on read
      favourites.store.ts        zustand persist
      favourites.hooks.ts        useFavouriteList, useIsFavourite
```

### Server

- **`staleTime` 5 min:** the API responds with `cache-control: no-store`, so all caching is done by TanStack Query.
- **No automatic refetch of the list:** `refetchOnWindowFocus` is off for all queries and the list query also has `refetchOnMount: false`, since a stale infinite query re-requests every loaded page in a row.
- **Cancellation:** the query `signal` is passed down to `fetch`; an abort is rethrown as is, not as a network error.
- **`useJobs`:** `useInfiniteQuery`, page size 30; the next page is derived from `total`. Pages are fetched by offset, so jobs are de-duplicated by `workAssignmentId` (the first copy wins).
- **`useJob`:** plain `useQuery` for `JobDetails`. **`useJobPreview(id)`** reads the list cache, so the details header shows immediately (the list items lack the details-only fields, so this is not `placeholderData`).
- **Retry:** 4xx (except 408 and 429) and `schema` errors are not retried; network errors, 5xx, 408 and 429 are retried twice.

### Client

- **State:** `Record<id, FavouriteJob>`.
- **Actions:** `toggle(job: JobPreview)` and `remove(id)`. Hooks: `useFavouriteList` (sorted by `addedAt`), `useIsFavourite(id)`, `useFavouritesCount`.
- **Robustness:** `persist` uses `version` and `migrate`. The localStorage content is validated with zod on read, entry by entry: invalid entries (including one whose key is not its `workAssignmentId`) are dropped, the valid ones are kept.
- **Several tabs:** a `storage` event for the favourites key rehydrates the store, so a stale tab does not overwrite another tab's changes.

## 6. Routes and pages

`routes/` holds route config only: path, param validation, loader and component wiring. Page JSX lives in `pages/`.

| File                    | Path          | Contents                                                                                                                                                           |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `routes/__root.tsx`     | —             | `createRootRouteWithContext<{ queryClient }>`, layout with header (Jobs, Favourites with a counter), `<Outlet />`, global `notFoundComponent` and `errorComponent` |
| `routes/index.tsx`      | `/`           | loader prefetches the first list page; `component: JobListPage`                                                                                                    |
| `routes/job.$id.tsx`    | `/job/$id`    | `params.parse` checks the id is a UUID with zod, otherwise `notFound()`; loader prefetches `jobQueryOptions(id)`; `component: JobDetailsPage`                      |
| `routes/favourites.tsx` | `/favourites` | no loader; `component: FavouritesPage`                                                                                                                             |
| `routeTree.gen.ts`      | —             | generated by the router plugin; committed                                                                                                                          |

`router.ts` creates the router with `context: { queryClient }` and `defaultPreload: 'intent'`.

```
pages/
  job-list/JobListPage.tsx
  job-details/JobDetailsPage.tsx
  favourites/FavouritesPage.tsx
  not-found/NotFoundPage.tsx
```

A page reads data through the hooks in `store/` and composes components. Loaders do not await their prefetch, so the page itself renders the skeletons.

## 7. Screen behaviour

| Screen              | Loading                                                 | Error                                | Empty                                  | Not found       |
| ------------------- | ------------------------------------------------------- | ------------------------------------ | -------------------------------------- | --------------- |
| Job list            | grid of `JobCardSkeleton`                               | `ErrorState` + Retry                 | "No jobs"                              | —               |
| Job list, next page | skeletons at the bottom                                 | error row + Retry; loaded cards stay | "End of list"                          | —               |
| Favourites          | —                                                       | —                                    | "No favourites yet" + link to the list | —               |
| Job details         | `JobDetailsSkeleton`, or the header from the list cache | `ErrorState` + Retry                 | —                                      | "Job not found" |

- **Infinite scroll:** a sentinel element at the bottom of the list and an `IntersectionObserver` that calls `fetchNextPage`.
- **Favourites:** cards render from localStorage with no requests. Clicking a card opens `/job/$id`, where details are fetched by id.
- **Unpublished job:** if a favourite job no longer exists, the details screen shows not-found with a "Remove from favourites" button.
- **Not found on details:** either the API returned 404, or the `id` is not a UUID. In the second case no request is made, because the API answers 401 to a non-UUID id.
- **`requirements`:** the API returns markdown; it is rendered with `react-markdown`. Some jobs have no `requirements`; the section is then hidden.
- **Job names** are plain text: the `*` in them is gender notation (`Mitarbeiter*in`), and rendering them as markdown would turn it into italics.

## 8. CORS, container and deployment

The browser always calls the relative `/api`. What answers it depends on how the app is run:

| Mode                       | Command             | Who proxies `/api`   |
| -------------------------- | ------------------- | -------------------- |
| Development                | `npm run dev`       | Vite `server.proxy`  |
| Local preview of the build | `npm run preview`   | Vite `preview.proxy` |
| Container, local           | `docker compose up` | nginx                |
| Production                 | Railway, same image | nginx                |

All four map `/api` to `https://www.coople.com/ch/resources/api`.

### Dockerfile

Multi-stage:

1. **Build stage (Node):** `npm ci`, `npm run build`.
2. **Runtime stage (nginx):** copies `dist` and `nginx/default.conf.template`.

### nginx

- **Port:** listens on `$PORT`. Railway injects it; the official nginx image substitutes it from the template at start.
- **`/api/`:** `proxy_pass` to the Coople origin with `proxy_ssl_server_name on` and the `Host` header set to `www.coople.com`. The host is a variable with a `resolver` (taken from `/etc/resolv.conf` via `NGINX_ENTRYPOINT_LOCAL_RESOLVERS`), so nginx re-resolves CloudFront IPs instead of keeping the ones from startup.
- **Everything else:** static files with `try_files $uri /index.html`, so `/job/:id` and `/favourites` work when opened directly.
- **Caching:** hashed assets are served as immutable; `index.html` is served with `no-cache`.

### Docker Compose

`docker-compose.yml` has one service that builds the `Dockerfile` and publishes it on `http://localhost:8080`. It is the easiest way to run the app: `docker compose up --build`, no Node needed on the host.

### Railway

One project with one service built from the `Dockerfile`. No environment variables are required; `PORT` is provided by Railway. How deploys are triggered is described in `quality.md`, section 5.

## 9. Tests and checks

Static checks, test levels, coverage, CI and CD are described in `quality.md`. Code is written test-first (see `AGENTS.md`).

## 10. Build order

1. Scaffold: Vite, Tailwind, shadcn, router, QueryClient, proxy; all scripts and tools from `quality.md`; CI workflow.
2. `entities/` and `api/` with tests.
3. `store/server` and the job list with infinite scroll and skeletons.
4. Job details with all states and not-found.
5. `store/client`, the favourite button and the Favourites page.
6. Design from Claude Design.
7. `Dockerfile`, nginx config, `docker-compose.yml`; Railway project and first deploy.
8. README and screen recording.

## 11. Assumptions and open points

- **Currency:** `currencyId: 1` is shown as CHF. The API has no currency dictionary.
- **`workDuration`:** looks like minutes (1980 for 4 shifts). The API does not state the unit.
- **`jobProfileId`, `educationalLevelId`, `countryId`:** not shown, because the API has no dictionaries for them.
- **Resolved:** a response without `data` is treated as `ApiError` of kind `schema` and shown as a regular error with Retry (covered by tests in `http-client.test.ts` and `JobDetailsPage.test.tsx`).
