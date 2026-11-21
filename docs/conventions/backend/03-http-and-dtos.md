# 03 — HTTP routes, DTOs, validation

> **When to read:** When adding or changing a route or DTO.

## 4. HTTP

### 4.1 Bootstrap (`main.ts`, configured once)

- `helmet()` before routes.
- Global prefix `api` + URI versioning, default `1` → `/api/v1/...`.
- One global `ValidationPipe` (§5.1).
- One global exception filter (§7).
- `enableShutdownHooks()`.

### 4.2 Routes

```text
GET    /api/v1/cars          list (search + pagination)
GET    /api/v1/cars/:id      read one
POST   /api/v1/cars          create
PATCH  /api/v1/cars/:id      partial update
DELETE /api/v1/cars/:id      delete
```

- Controllers do not repeat `api` or `v1` in `@Controller()`.
- Plural nouns, no verbs in paths (`/getCars` is forbidden).
- `PATCH` for partial updates. Never use `GET` for anything destructive.
- Nest at most one level deep (e.g. `/cars/:id/image`).
- The exact route list lives in the API spec (`docs/specs/api/`). The spec wins over this example.

### 4.3 Controllers

A controller may only: declare routes and status codes, receive DTOs or pipes, call a service, and map the result to a response DTO.

A controller must not: inject a repository or storage client, contain business conditions, or catch errors just to rethrow them. `@Req()` / `@Res()` are allowed only for things Nest decorators cannot express (e.g. file upload), with a short comment.

### 4.4 Success responses

No universal `{ success, data }` envelope.

| Operation | Status | Body |
|---|---:|---|
| Read one | 200 | Response DTO |
| Read list | 200 | `{ data, meta }` |
| Create | 201 | Created response DTO |
| Update | 200 | Updated response DTO |
| Delete | 204 | No body |

### 4.5 Pagination and search

- `page` defaults to `1`. `limit` defaults to `20`, max `100`. Invalid values fail validation (422); they are not silently corrected.
- Search and sort fields are an **allowlist** in the query DTO. Never interpolate request input into a column name or SQL.

```json
{ "data": [], "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

---

## 5. DTOs and validation

### 5.1 Validation stack

`class-validator` + `class-transformer` through one global pipe:

```text
ValidationPipe { transform: true, whitelist: true, forbidNonWhitelisted: true, errorHttpStatusCode: 422 }
```

Use `ParseUUIDPipe` for `:id`. Car field rules and normalisation follow [ADR-0016](../../adr/0016-car-field-rules.md); normalise (trim / collapse whitespace) with `class-transformer` `@Transform` **before** length checks. The province allowlist is a const in `modules/cars/entities/province.const.ts` (§9.2). DTOs check transport facts (required, type, length, format). Rules that depend on stored data, such as uniqueness, belong in the service and DB constraint (§9.4).

### 5.2 One DTO per direction and action

- Never use an entity as a request or response.
- Server-owned fields (`id`, `createdAt`, `updatedAt`, `imageKey`) must not appear in write DTOs.
- `PartialType(CreateCarDto)` is fine only when every create field is editable.

### 5.3 Services do not import DTOs

DTOs stop at the controller. A service declares its own input `type` in the service file. TypeScript's structural typing lets the controller pass the DTO in.

### 5.4 Response DTOs are mandatory

Map explicitly, e.g. `CarResponseDto.fromEntity(car)`. The mapper lists every exposed field, so a new column never leaks by accident. 👁️

### 5.5 Optional vs null

- A field omitted from a PATCH means "leave unchanged". `null` means "clear" and is allowed only on nullable fields (e.g. `notes`).
- A nullable response field is sent as `null`, never omitted.

### 5.6 Wire formats

| Value | API | PostgreSQL |
|---|---|---|
| ID | UUID string | `uuid` |
| Timestamp | ISO 8601 UTC with `Z` | `timestamptz` |
| Date only | `YYYY-MM-DD` | `date` |
| Image | `{ id, url, createdAt }`; `url` is a public MinIO URL | `car_images.object_key varchar` |
