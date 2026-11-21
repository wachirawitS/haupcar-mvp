# 09 — TypeScript and checks

> **When to read:** When changing tsconfig or lint, or when a check fails.

## 17. TypeScript and checks

### 17.1 Compiler

Keep the Nest CLI defaults, plus:

```text
strict: true
noUncheckedIndexedAccess: true
noImplicitOverride: true
```

### 17.2 Rules

- No `any`. Receive unknown data as `unknown` and narrow it.
- `type` by default. Use `interface` only when something requires it.
- No TypeScript `enum` (§9.2).
- No non-null assertion `!` in logic. Definite assignment `!` is allowed only on decorated properties in `dto/` and `entities/`.
- No `export default` (§3.2). No `forwardRef()` (§2.3). No `process.env` outside `src/config/` (§11).

### 17.3 ESLint (keep it small)

Enforce mechanically: `no-explicit-any`, `no-non-null-assertion` (off for dto/entities), `consistent-type-definitions: type`, no enums, no default exports, `process.env` only in `src/config/`.

Boundary rules (controller → repository, service → DTO) are review-only 👁️.

### 17.4 Before every commit

```bash
npm run lint
npm run build
npm run test
npm run test:e2e   # when routes changed
```

### 17.5 Review checklist 👁️

- Business logic leaking into a controller, repository, or entity
- A response DTO exposing a field it should not
- Server-owned fields accepted in a write DTO
- Duplicate check relying only on a pre-check instead of the DB constraint
- Images: key generated server-side, type/size validated, object deleted with the car
- Secrets or credentials in logs, errors, or committed files
- The route matches the API spec and Swagger is updated
- An unapproved dependency added quietly
