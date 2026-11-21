# 02 — Structure, naming, imports

> **When to read:** When creating a module or file, or when one module needs another.

## 2. Project structure

### 2.1 `src/` is a closed list

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/            # business capabilities (§1.1)
│   ├── common/             # shared Nest building blocks: filters/, guards/ (global JwtAuthGuard), decorators/ (@Public), dto/
│   ├── config/             # validated typed configuration (§11)
│   ├── database/           # DataSource, error classifier, seeds/
│   └── migrations/         # TypeORM migrations
└── test/                   # e2e tests
```

Do not add `utils/`, `helpers/`, `shared/`, `core/`, `domain/`, or `infrastructure/`. If something does not fit, ask first (README).

### 2.2 Module layout

```text
src/modules/cars/
├── cars.module.ts
├── controllers/car.controller.ts
├── services/cars.service.ts
├── services/cars.service.spec.ts
├── repositories/car.repository.ts
├── entities/car.entity.ts
└── dto/
    ├── create-car.dto.ts
    ├── update-car.dto.ts
    ├── list-cars-query.dto.ts
    └── car-response.dto.ts
```

| Folder | Owns | Must not own |
|---|---|---|
| `controllers/` | Routes, status codes, DTO in/out | Business rules, queries |
| `services/` | Use cases, business rules | HTTP DTOs, QueryBuilder, S3 SDK calls |
| `repositories/` | All DB reads/writes | HTTP exceptions, business decisions |
| `entities/` | TypeORM table mapping | Logic, injected deps |
| `dto/` | HTTP request/response contracts | Persistence, workflows |

- Do not create an empty folder. Create it together with its first file.
- Move something to `common/` only when a **second** module needs it. `common/` must not import from `modules/`.

### 2.3 Module boundaries

- Another module may use only the services a module explicitly `exports`. Never import its entity, repository, controller, or DTO.
- `forwardRef()` is forbidden. Business modules must not be `@Global()`.

---

## 3. Naming, exports, imports

### 3.1 Naming

| Thing | Rule | Example |
|---|---|---|
| Files, folders | `kebab-case` | `car-response.dto.ts` |
| Module folder | capability, plural | `modules/cars/` |
| Nest module | `<Capability>Module` | `CarsModule` |
| Controller | singular + `Controller` | `CarController` |
| Service | capability + `Service` | `CarsService` |
| Repository | singular + `Repository` | `CarRepository` |
| Entity | singular + `Entity` | `CarEntity` |
| Request DTO | action + resource + `Dto` | `CreateCarDto` |
| Response DTO | resource + `ResponseDto` | `CarResponseDto` |
| Types | `PascalCase`, no `I` prefix | `CreateCarInput` |
| Booleans | `is` / `has` / `can` | `hasImage` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_IMAGE_BYTES` |
| DB table | plural `snake_case` | `cars` |
| DB column | `snake_case` | `registration_number` |
| Constraint / index | named `snake_case` | `uq_cars_registration_number_province` |
| URL resource | plural `kebab-case` | `/api/v1/cars` |

### 3.2 Exports and imports

- Named exports only. No `export default`.
- One primary exported class per file.
- No barrel `index.ts` files. Import the exact file.
- Relative imports only. No `@/` or `src/` path aliases, because `tsc` does not rewrite them and they break at runtime.
