# 05 — Services and persistence

> **When to read:** When writing business logic, entities, repositories, or migrations.

## 8. Services

- One `<module>.service.ts` per module, with methods named after use cases: `createCar()`, `listCars()`, `updateCar()`, `deleteCar()`.
- No `BaseService`, `CrudService`, or one-class-per-use-case.
- A service checks business rules, calls its repositories and the storage client, and returns entities or result types. The controller maps them to response DTOs.
- A service must not import DTOs or controllers, use QueryBuilder or `Repository<Entity>` directly, or call the S3 SDK directly.

## 9. Persistence

### 9.1 Entities

- UUID primary key, plus `createdAt` / `updatedAt` as `timestamptz`.
- Name tables and columns explicitly in decorators (`@Column({ name: "registration_number" })`). No naming-strategy package.
- Do not extend TypeORM `BaseEntity`, and do not create a shared base entity.
- No soft delete (`deletedAt`) unless a spec asks for it.
- No logic or hooks in entities.

### 9.2 Enumerated values

No TypeScript `enum` and no PostgreSQL enum type. Use a `const` object plus a union type in `entities/<name>.const.ts`, and a named `CHECK` constraint over `varchar` in the DB.

### 9.3 Repositories

- Only `repositories/` may use `Repository<Entity>`, QueryBuilder, or raw SQL.
- Method names express intent: `findById()`, `findPage(query)`, `existsByPlate(registrationNumber, province)`.
- Never return a QueryBuilder to a service. No `BaseRepository`.
- Raw SQL only with bound parameters. Never interpolate strings.

### 9.4 Constraints and migrations

- Enforce invariants in the DB as well: `NOT NULL`, `UNIQUE` (`uq_cars_registration_number_province`), named `CHECK`s. A pre-check in the service is not enough on its own, because two requests can race. Rely on the constraint plus the classifier (§7.3).
- Schema changes go through TypeORM **migrations** in `src/migrations/`. `synchronize` must be `false` everywhere.
- Migrations are committed and never edited after they have been run. Add a new migration instead.

### 9.5 Transactions

A single statement needs no transaction. Use `dataSource.transaction(async (manager) => ...)` only when several writes must succeed together, and pass `manager` to every repository call inside it. Never call MinIO inside a DB transaction.
