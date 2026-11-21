# 06 — File storage, configuration, logging & health

> **When to read:** When touching image upload, env vars, logging, or health checks.

## 10. File storage (MinIO, [ADR-0007](../../adr/0007-file-storage-minio.md))

- Use `@aws-sdk/client-s3` with `forcePathStyle: true` (needed by MinIO). Wrap it in **one** storage client class (e.g. `common/storage/` once shared, or `modules/cars/clients/` while only cars uses it). Services call the client, never the SDK.
- A car has many images ([ADR-0012](../../adr/0012-multiple-images-per-car.md)) in the `car_images` table, owned by the `cars` module.
- The DB stores the **object key** only (e.g. `cars/<carId>/<uuid>.jpg`), never a full URL and never the file bytes.
- Max 10 images per car (`CAR_IMAGES_MAX`). Order and cover come from `created_at ASC`. Enforce the limit in the service.
- Generate object keys on the server. Never use the uploaded file name as the key.
- Validate the file **type** (allowlist, e.g. `image/jpeg`, `image/png`, `image/webp`) and **size** (limit in config) on the server, even if the frontend checks too.
- Deleting a car or an image must also delete its MinIO object(s). If the MinIO delete fails, log it; do not fail the request after the DB row is gone. 👁️
- Upload = `multipart/form-data` to the API, via `FilesInterceptor` ([ADR-0012](../../adr/0012-multiple-images-per-car.md)). Use memory storage, so nothing is written to the container disk. Set multer `limits` (file size, file count) from config **and** re-check in the service, because the count limit depends on how many images already exist.
- Validate the type by content (magic bytes), not only by the client-sent `mimetype`. 👁️
- Serving: public-read bucket ([ADR-0012](../../adr/0012-multiple-images-per-car.md)). The anonymous policy allows `s3:GetObject` **only**, never list, put, or delete. 👁️
- The response DTO exposes `url`, built by the storage client from `MINIO_PUBLIC_URL` (browser-reachable). Never expose the internal Docker endpoint. The DB still stores only the key.
- The bucket and its GetObject-only policy are created by the `minio-init` compose service ([ADR-0020](../../adr/0020-compose-startup-init.md)), **not** by the app. The app never creates buckets or changes policies.

## 11. Configuration

- Use `@nestjs/config`. Only files in `src/config/` may read `process.env`.
- Validate config at startup. A missing or invalid required value stops the app. Secrets have no fallback defaults.
- Split config by concern: `app.config.ts`, `database.config.ts`, `storage.config.ts`, `auth.config.ts`.
- Inject typed config with `ConfigType<typeof xConfig>`. Do not scatter `configService.get("KEY")` calls.
- Commit `.env.example`. Never commit `.env`.

## 12. Logging & health

- Use Nest's built-in `Logger`, with no extra logging library. Log meaningful events and failures, not every method call.
- Never log passwords, tokens, cookies, full request bodies, or file contents.
- `GET /health` is public and version-neutral, and checks DB connectivity. Docker Compose uses it as the backend healthcheck. It must not expose hostnames or error details.
- CORS is enabled because the browser calls the API directly ([ADR-0010](../../adr/0010-browser-calls-api-directly.md)). Allow the **exact** frontend origin from config (`CORS_ORIGIN`). `*` is forbidden.
- JSON body limit: 1 MB. The image upload route has its own explicit limit (§10).
