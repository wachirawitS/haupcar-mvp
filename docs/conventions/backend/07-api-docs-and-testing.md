# 07 — OpenAPI, testing, seeds

> **When to read:** With every route change, and when writing tests or seeds.

## 13. OpenAPI

- The **design contract** lives in `docs/specs/api/` and is written before the code (spec-driven).
- The **implementation** exposes Swagger via `@nestjs/swagger`, with schemas derived from DTOs. Swagger UI is served at `/api/docs` for reviewers.
- Every route declares: summary and tag, auth requirement, params/query/body, success status and response DTO, and error responses using the shared error schema.
- The implemented API must match the spec. If it diverges, update the spec first (with the owner's approval), then the code. 👁️

## 14. Testing

### 14.1 Layers

| Test | Location | Covers |
|---|---|---|
| Service unit | colocated `*.spec.ts` | Business rules, error paths. Repositories and storage are mocked |
| HTTP e2e | `test/*.e2e-spec.ts` | Real routes with Supertest: validation (422), auth (401), status codes, response shape, CRUD flow |

- Each test names the spec AC it covers, e.g. `it("SPEC-001/AC-3: rejects duplicate registration", ...)`.
- E2E tests use a **real PostgreSQL** (a separate test DB or container), never SQLite. MinIO may be mocked in e2e tests.
- Do not test getters, decorators, or module wiring. Coverage is a signal, not a target. Cover the happy path and the important failures.

### 14.2 Isolation

- Tests do not depend on each other's order. Each test creates the data it needs.
- Never point tests at the dev database.

### 14.3 Seeds

- `npm run seed` loads a few realistic fake cars into the local DB. It is idempotent and never runs automatically on startup.
- No real personal data.
