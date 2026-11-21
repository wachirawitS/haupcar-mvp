# Backend Conventions (NestJS)

> **Purpose.** How backend code is written in this repo, so it reads like one person wrote it.
> Reviews check code against these rules.
>
> **Scope.** One NestJS REST API ([ADR-0005](../../adr/0005-backend-nestjs.md)) on PostgreSQL ([ADR-0006](../../adr/0006-database-postgresql.md)),
> with MinIO for car images ([ADR-0007](../../adr/0007-file-storage-minio.md)), run by Docker Compose ([ADR-0008](../../adr/0008-runtime-docker-compose.md)).
>
> **Status.** A standing rule set, not a feature spec. A feature spec decides *what* to build; these files decide *how*.

## How to use

- Rules use **must** / **must not**. 👁️ marks a **review-only** rule that tooling cannot check.
- Section numbers (§) are global and stable. Cite them in reviews, e.g. `§4.2`.
- ⏳ marks a rule that waits on an open decision. Do not implement that part until its ADR is accepted.

## Section map

| § | Topic | File |
|---|---|---|
| 1 | Architecture | [`01-architecture.md`](01-architecture.md) |
| 2–3 | Project structure, naming, imports | [`02-structure-and-naming.md`](02-structure-and-naming.md) |
| 4–5 | HTTP routes, DTOs, validation | [`03-http-and-dtos.md`](03-http-and-dtos.md) |
| 6–7 | Auth, error contract | [`04-auth-and-errors.md`](04-auth-and-errors.md) |
| 8–9 | Services, persistence | [`05-services-and-persistence.md`](05-services-and-persistence.md) |
| 10–12 | File storage, configuration, logging & health | [`06-storage-config-ops.md`](06-storage-config-ops.md) |
| 13–14 | OpenAPI, testing, seeds | [`07-api-docs-and-testing.md`](07-api-docs-and-testing.md) |
| 15–16 | Dependencies, Docker | [`08-dependencies-and-docker.md`](08-dependencies-and-docker.md) |
| 17 | TypeScript and checks | [`09-typescript-and-checks.md`](09-typescript-and-checks.md) |

## What to read for a task

| Task | Files |
|---|---|
| New file or module | `01`, `02` |
| New or changed route | `02`, `03`, `04`, `07` |
| Entity, migration, repository | `02`, `05` |
| Image upload / MinIO, config, health | `06` |
| Tests or seeds | `07` |
| New dependency, Dockerfile | `08` |
| tsconfig, lint | `09` |

## When nothing here covers it

1. Stop and ask. Do not invent a pattern.
2. Follow the nearest existing example when it complies with these rules.
3. Do not add a dependency without updating §15 first.
4. Do not change a convention inside a feature change. Convention changes are their own commit.
