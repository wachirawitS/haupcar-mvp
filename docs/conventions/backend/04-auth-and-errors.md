# 04 — Auth and error contract

> **When to read:** When touching login, guards, or error handling.

## 6. Authentication ([ADR-0009](../../adr/0009-auth-fixed-credentials.md))

### 6.1 Rules that hold no matter which mechanism is chosen

- The fixed username and password come from configuration (§11). They are never hard-coded or committed.
- Compare the password in constant time (e.g. `crypto.timingSafeEqual`), never with `===`.
- **Protected by default:** the auth guard is registered globally. Anonymous routes opt out with a `@Public()` decorator. Only `login`, `health` and the read-only `shared/:token/...` routes (which check the share token instead) are public.
- A failed login returns `401 INVALID_CREDENTIALS` and does not reveal whether the username or the password was wrong.
- Never log credentials or tokens.
- No roles and no permissions. There is one fixed user.

### 6.2 Mechanism ([ADR-0011](../../adr/0011-auth-jwt-bearer-localstorage.md))

- `POST /api/v1/auth/login` (public) with `{ username, password }` → `200 { accessToken, expiresIn }`.
- Sign the JWT with `@nestjs/jwt`, using a secret from config (`JWT_SECRET`, required, no default). Use one fixed algorithm (HS256). `sub` = the fixed username.
- The global guard reads `Authorization: Bearer <token>` and verifies the signature and expiry. Missing, invalid, or expired → `401 UNAUTHORIZED`.
- No refresh tokens and no server-side session. Logout is client-side.
- Token lifetime: 8 hours, from config `JWT_EXPIRES_IN` (default `8h`). When it expires, the user logs in again.

---

## 7. Error contract

### 7.1 One error shape (produced by the global exception filter)

```json
{
  "statusCode": 422,
  "code": "VALIDATION_FAILED",
  "message": "The request contains invalid fields",
  "fieldErrors": {
    "registrationNumber": [{ "code": "REQUIRED", "message": "registrationNumber is required" }]
  }
}
```

- `fieldErrors` appears only for field-level problems.
- `code` is stable `SCREAMING_SNAKE_CASE`. The frontend branches on `code` only, never on `message`.
- `message` is safe English. Unknown errors become `500 INTERNAL_ERROR` with a generic message.
- Never return a stack trace, SQL, constraint names, MinIO/S3 errors, or secrets.

### 7.2 Expected codes

| Status | Code | When |
|---:|---|---|
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | Missing/invalid auth / wrong login |
| 404 | `CAR_NOT_FOUND` / `CAR_IMAGE_NOT_FOUND` | ID does not exist |
| 404 | `SHARE_LINK_NOT_FOUND` | Share token unknown or revoked (same answer for both) |
| 422 | `CAR_IMAGE_LIMIT_REACHED` | More than 10 images on one car |
| 409 | `CAR_PLATE_EXISTS` | Duplicate plate (registration number + province, [ADR-0016](../../adr/0016-car-field-rules.md)) |
| 413 / 422 | `FILE_TOO_LARGE` / `UNSUPPORTED_FILE_TYPE` | Image upload limits (§10) |
| 422 | `VALIDATION_FAILED` | DTO validation |
| 500 | `INTERNAL_ERROR` | Anything unexpected |

The API spec is the final list. Add new codes there first.

### 7.3 Where errors are decided

- Services throw Nest exceptions (`NotFoundException`, `ConflictException`, ...) with the §7.1 payload.
- Repositories return `Entity | null` for "not found". They never throw HTTP exceptions.
- Controllers do not catch and translate errors.
- A duplicate key is detected by the PostgreSQL error code `23505` plus the named constraint, through a classifier in `database/`. Never match error message text.
- Log 4xx at `warn` and 5xx at `error` (with the stack, in the log only).
