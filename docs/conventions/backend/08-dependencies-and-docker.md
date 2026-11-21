# 08 — Dependencies and Docker

> **When to read:** Before adding a package or changing the Dockerfile.

## 15. Dependencies

### 15.1 Approved runtime packages

```text
@nestjs/common  @nestjs/core  @nestjs/platform-express  @nestjs/config
@nestjs/typeorm  @nestjs/swagger  typeorm  pg
class-validator  class-transformer  helmet  reflect-metadata  rxjs
@aws-sdk/client-s3                  # MinIO (S3-compatible)
@nestjs/jwt                         # JWT sign/verify (ADR-0011)
```

Not needed: `@aws-sdk/s3-request-presigner`. Images are served from a public-read bucket ([ADR-0012](../../adr/0012-multiple-images-per-car.md)).

### 15.2 Approved dev packages

```text
@nestjs/cli  @nestjs/testing  typescript  jest  ts-jest  supertest  @types/multer
eslint  typescript-eslint  prettier
```

- A new direct dependency requires updating this list first, in its own commit.
- Do not add lodash, moment/dayjs, passport, winston/pino, redis, or similar without a real need.

### 15.3 Runtime

- npm with a committed `package-lock.json`. Docker uses `npm ci`.
- Node.js 24 LTS (`"engines": { "node": ">=24 <25" }`), CommonJS output.

## 16. Docker ([ADR-0008](../../adr/0008-runtime-docker-compose.md))

- Multi-stage Dockerfile: build stage → slim runtime with compiled output and production dependencies only.
- Pinned base image (e.g. `node:24-slim`), never `latest`.
- Run as a non-root user. One Nest process per container.
- Config arrives via environment variables at runtime. Never copy `.env` into the image. Keep a `.dockerignore`.
- On start, run migrations (`migration:run`), then start Nest. A failed migration stops the container.
- Compose startup order uses healthchecks + `depends_on` conditions: postgres healthy, minio-init completed, then backend, then frontend ([ADR-0020](../../adr/0020-compose-startup-init.md)).
- Seeds never run automatically.
