# 03 — API client, data & state

> **When to read:** When calling the API or handling list, search, or pagination state.

## 3. API client

- **One** HTTP client in `lib/api-client.ts`. It sets the base URL from validated env (`lib/env.ts`), sends JSON, parses the error body (§3.1), and handles `204` without parsing JSON.
- Each resource has typed functions in `features/<f>/api/` (e.g. `listCars`, `getCar`, `createCar`, `updateCar`, `deleteCar`). Components never build URLs or call `fetch` directly.
- The API base URL comes from `NEXT_PUBLIC_API_URL` (public, because the browser calls it directly; [ADR-0010](../../adr/0010-browser-calls-api-directly.md)). Never hard-code `localhost`.
- Auth ([ADR-0011](../../adr/0011-auth-jwt-bearer-localstorage.md)): the token lives in `localStorage` and is read and written **only** through `lib/auth-token.ts` (transport infrastructure, so `lib` never imports `features`). `lib/api-client.ts` attaches `Authorization: Bearer <token>`. Components never touch `localStorage` directly.
- Logout = remove the token, clear the TanStack Query cache, and go to `/login`.
- Never store secrets in `NEXT_PUBLIC_*` variables.

### 3.1 Errors from the API

The client turns non-2xx responses into one typed `ApiError` carrying `{ statusCode, code, message, fieldErrors? }` (backend §7.1).

- UI logic branches on `code` only, never on `message`.
- `401` from any call except login → remove the token, clear the query cache, and redirect to `/login`. This is handled once, in the API client.
- Never render the raw `message`. Map `code` to the UI's own text, with a generic fallback.

## 4. Data & state

- **TanStack Query** owns server data: queries for reads, mutations for writes. Do not copy server data into `useState` or a global store.
- Query and mutation hooks live in `features/<f>/hooks/`. Query keys live in one `query-keys.ts` per feature.
- After a create, update, or delete mutation, invalidate the car list (and that car's detail) keys.
- Do not auto-retry mutations. Do not retry `4xx` responses.
- Search, page, and limit live in **URL search params**, so the list is shareable and survives refresh. Validate them before sending.
- Local UI state (dialog open, selected row) uses `useState`. No global store unless a real cross-page need appears.
- Every data view handles **loading**, **error with retry**, **empty**, and **content**. 👁️
- A hook returns data and actions, never JSX. Do not wrap a single `useState` in a custom hook.
