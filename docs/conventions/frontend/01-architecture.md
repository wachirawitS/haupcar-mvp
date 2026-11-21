# 01 — Architecture & folder layout

> **When to read:** Once per session, and when adding a page or folder.

## 1. Architecture

### 1.1 Baseline

- Next.js App Router with TypeScript.
- **All business data goes through the NestJS REST API.** Do not access the DB or MinIO credentials from Next.js, and do not put business logic in server actions or route handlers ([ADR-0004](../../adr/0004-frontend-nextjs.md)).
- **The browser calls the NestJS API directly** ([ADR-0010](../../adr/0010-browser-calls-api-directly.md)). Data is fetched in Client Components through TanStack Query. Do not use Server Components, route handlers, or server actions to fetch or change business data.
- Pages that show data are Client Components (`"use client"`) or render one. Layouts and static shells may stay Server Components.
- UI language: **Thai only**, with no i18n framework ([ADR-0018](../../adr/0018-ui-language-thai.md)). User-facing copy lives in the owning feature (`features/<f>/messages.ts`), including the mapping from error `code` to Thai text. Code and API stay in English. `<html lang="th">` and a Thai web font via `next/font`.

### 1.2 Folder layout (closed list)

```text
frontend/
├── app/                        # routes, layouts only — thin
│   ├── layout.tsx
│   ├── providers.tsx           # "use client" QueryClientProvider
│   ├── error.tsx  not-found.tsx
│   ├── page.tsx                # redirects to /cars
│   ├── login/page.tsx
│   └── cars/
│       ├── layout.tsx          # RequireAuth + header
│       ├── page.tsx            # list
│       ├── new/page.tsx        # create
│       └── [id]/edit/page.tsx  # edit
│   └── shared/[token]/page.tsx # public read-only list (share link)
├── features/
│   ├── cars/
│   │   ├── components/         # car-table.tsx, car-form.tsx, ...
│   │   ├── hooks/              # use-cars.ts, use-create-car.ts, ...
│   │   ├── api/                # cars-api.ts — typed calls for this resource
│   │   ├── schemas/            # car-form.schema.ts (Zod)
│   │   ├── constants/          # provinces.ts — static lists mirrored from the backend
│   │   ├── messages.ts         # Thai UI copy + error code → Thai text
│   │   ├── query-keys.ts
│   │   └── types.ts            # wire types for this feature
│   └── auth/                   # login form, RequireAuth, use-login.ts
├── components/ui/              # generic primitives (shadcn)
└── lib/                        # api-client.ts, api-error.ts, auth-token.ts, env.ts, query-client.ts, utils.ts
```

Full file-level tree: [`plan/project-structure.md`](../../plan/project-structure.md). The routes above are fixed by [ADR-0017](../../adr/0017-pages-and-flow.md). Adding a page requires a new ADR.

### 1.3 Responsibilities

| Folder | Owns | Must not own |
|---|---|---|
| `app/` | Routing, layout, reading route params, composing feature components | Fetch logic, forms, business UI |
| `features/<f>/` | Everything for that feature | Imports from another feature's internals |
| `components/ui/` | Generic, reusable primitives | API calls, domain types (`Car`) |
| `lib/` | Shared infrastructure: HTTP client, env, query client | Imports from `app/`, `features/`, `components/` |

- Create a folder only together with its first file.
- Move code to `components/` or `lib/` only when a **second** feature needs it.
