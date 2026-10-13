# Coople public API and CORS

Verified: 2026-10-13, Chrome, page served from `http://localhost:5199` (no CSP).

## Finding

The Coople public API does **not** send CORS headers. A browser app running on `localhost` cannot read its responses directly.

## Evidence

Endpoints (base `https://www.coople.com/ch/resources/api/work-assignments/public-jobs`):

| Browser request from `localhost`                             | Result                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `GET /list?pageNum=0&pageSize=30`                            | `TypeError: Failed to fetch`                                              |
| `GET /{id}` (existing job)                                   | `TypeError: Failed to fetch`                                              |
| `GET /{id}` (non-existent id, API answers 404)               | `TypeError: Failed to fetch`                                              |
| `GET /list` with `Accept` / `Content-Type: application/json` | `TypeError: Failed to fetch`                                              |
| `GET /list` with `mode: 'no-cors'`                           | `type: opaque`, `status: 0` (request reached the server, body unreadable) |

Server side (curl, `Origin: http://localhost:5173`):

- `GET` responses are `200` and contain no `Access-Control-Allow-Origin` header.
- `OPTIONS` preflight returns `401`.
- `curl` / server-side requests work fine, so the block is the browser's CORS policy, not the request itself.

Not captured: the literal "blocked by CORS policy" console message (console tracking was started after the page loaded). The conclusion rests on the `no-cors` opaque response and the missing header.

## Implications

- **Web app:** the browser must not call the API cross-origin. Requests have to go through a same-origin proxy (e.g. Vite `server.proxy`: `/api` → `https://www.coople.com/ch/resources/api`). A deployed build needs an equivalent rewrite/proxy on the host — document this in the README.
- **React Native:** not affected by CORS.
- Client code should use a configurable base URL (relative `/api` in the browser) instead of hard-coding the Coople origin.

## Related API notes

- Response envelope: `{ status, data, errorCode, errorDetails, errorId, error }`.
- Unknown job id → HTTP `404`, body `{ error: true, errorCode: "Object_not_found", errorId: 10004 }` with no `data`.
- List `data` is `{ items, total }`; `total` was 716 with `pageSize=30`.
- First request took ~5.5 s; responses are `cache-control: no-store`.
