# Architecture

Approved: 2026-10-13. This is the plan the app is built against. Update it when a decision changes.

The app is frontend only. The task does not ask for a backend, and Favourites are stored in the browser. The only server-side piece is a proxy that works around CORS (see `api-cors.md`).

## 1. Stack

| Area | Choice |
|---|---|
| Build | Vite + React + TypeScript (strict) |
| UI | shadcn/ui + Tailwind v4 |
| Server state | TanStack Query |
| Client state | zustand + `persist` (localStorage) |
| Routing | TanStack Router, file-based |
| Validation and types | zod; types are inferred from schemas |
| Tests | Vitest |

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

| Entity | Fields |
|---|---|
| `Money` | `amount: number`, `currencyId: number` |
| `JobLocation` | `addressStreet`, `extraAddress`, `zip`, `city: string`, `countryId: number`, `state?: string` |
| `JobSkill` | `jobProfileId: number`, `educationalLevelId?: number` |
| `JobSummary` (list item) | `workAssignmentId`, `waReadableId`, `workAssignmentName`, `branchLink: string`; `hourlyWage`, `salary: Money`; `jobSkill: JobSkill`; `jobLocation: JobLocation`; `periodFrom`, `datePublished: number` (epoch ms) |
| `JobDetails` | `JobSummary` + `requirements: string`, `clothingRequirements?: string`, `periodTo`, `firstShiftTo`, `shiftsCount`, `workDuration: number` |
| `JobPreview` | `Pick<JobSummary, …>` with exactly the fields the card shows |
| `FavouriteJob` | `JobPreview & { addedAt: number }` |
| `Paginated<T>` | `items: T[]`, `total: number` |

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
- **`HttpClient`:** requests the relative `/api` base (configurable through env), unwraps the envelope `{ status, data, error, errorCode, errorId }` and validates `data` with zod. It is passed to each resource through the constructor.
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
    favourites.store.ts     zustand persist
```

### Server

- **`staleTime` 5 min:** the API responds with `cache-control: no-store`, so all caching is done by TanStack Query.
- **`useJobs`:** `useInfiniteQuery`, page size 30; the next page is derived from `total`.
- **`useJob`:** `placeholderData` comes from the list cache, so the details header shows immediately.
- **Retry:** 4xx is not retried; network errors and 5xx are retried twice.

### Client

- **State:** `Record<id, FavouriteJob>`.
- **Actions:** `toggle(job: JobPreview)`, `isFavourite(id)`, and a selector that returns the list sorted by `addedAt`.
- **Robustness:** `persist` uses `version` and `migrate`. The localStorage content is validated with zod on read; invalid data resets to an empty state.

## 6. Routes and pages

`routes/` holds route config only: path, param validation, loader and component wiring. Page JSX lives in `pages/`.

| File | Path | Contents |
|---|---|---|
| `routes/__root.tsx` | — | `createRootRouteWithContext<{ queryClient }>`, layout with header (Jobs, Favourites with a counter), `<Outlet />`, global `notFoundComponent` and `errorComponent` |
| `routes/index.tsx` | `/` | loader prefetches the first list page; `component: JobListPage` |
| `routes/job.$id.tsx` | `/job/$id` | `params.parse` checks the id is a UUID with zod, otherwise `notFound()`; loader prefetches `jobQueryOptions(id)`; `component: JobDetailsPage` |
| `routes/favourites.tsx` | `/favourites` | no loader; `component: FavouritesPage` |
| `routeTree.gen.ts` | — | generated by the router plugin; committed |

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

| Screen | Loading | Error | Empty | Not found |
|---|---|---|---|---|
| Job list | grid of `JobCardSkeleton` | `ErrorState` + Retry | "No jobs" | — |
| Job list, next page | skeletons at the bottom | error row + Retry; loaded cards stay | "End of list" | — |
| Favourites | — | — | "No favourites yet" + link to the list | — |
| Job details | `JobDetailsSkeleton`, or the header from the list cache | `ErrorState` + Retry | — | "Job not found" |

- **Infinite scroll:** a sentinel element at the bottom of the list and an `IntersectionObserver` that calls `fetchNextPage`.
- **Favourites:** cards render from localStorage with no requests. Clicking a card opens `/job/$id`, where details are fetched by id.
- **Unpublished job:** if a favourite job no longer exists, the details screen shows not-found with a "Remove from favourites" button.
- **Not found on details:** either the API returned 404, or the `id` is not a UUID. In the second case no request is made, because the API answers 401 to a non-UUID id.
- **`requirements`:** the API returns markdown; it is rendered with `react-markdown`.

## 8. CORS

- **Local:** Vite `server.proxy` and `preview.proxy` map `/api` to `https://www.coople.com/ch/resources/api`.
- **Deployment:** the host needs the same rewrite. Document it in the README.

## 9. Tests

Vitest covers `HttpClient` (envelope, the three error kinds), `JobsResource` (schemas against real fixtures), the favourites store (toggle, corrupt localStorage) and the formatters.

## 10. Build order

1. Scaffold: Vite, Tailwind, shadcn, router, QueryClient, proxy.
2. `entities/` and `api/` with tests.
3. `store/server` and the job list with infinite scroll and skeletons.
4. Job details with all states and not-found.
5. `store/client`, the favourite button and the Favourites page.
6. Design from Claude Design.
7. README and screen recording.

## 11. Assumptions and open points

- **Currency:** `currencyId: 1` is shown as CHF. The API has no currency dictionary.
- **`workDuration`:** looks like minutes (1980 for 4 shifts). The API does not state the unit.
- **`jobProfileId`, `educationalLevelId`, `countryId`:** not shown, because the API has no dictionaries for them.
- **Deployment:** local run and a screen recording only.
- **Open:** while checking field types, one of 8 details requests came back without `data`. The cause is not known yet. Check it in build step 2, because it affects error handling.
