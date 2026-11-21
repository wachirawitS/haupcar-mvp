# 06 — Dependencies & checks

> **When to read:** Before adding a package or committing.

## 8. Dependencies & checks

### 8.1 Approved packages

```text
next  react  react-dom  typescript
tailwindcss  shadcn/ui (copied components + their Radix/Base UI deps)  clsx  tailwind-merge  lucide-react
@tanstack/react-query
react-hook-form  zod  @hookform/resolvers
sonner                     # toasts (shadcn default)
```

Dev: `eslint`, `eslint-config-next`, `prettier`, `vitest`.

- A new direct dependency requires updating this list first, in its own commit.
- Do not add axios, redux/zustand, moment/dayjs, lodash, or a second UI kit without a real need.
- npm with a committed `package-lock.json`. Node.js 24 LTS.

### 8.1b Tests ([ADR-0019](../../adr/0019-frontend-testing.md))

- Vitest unit tests for **pure logic only**: Zod schemas and API client error handling / error-code mapping.
- Colocated `*.test.ts`. Each test names the AC it covers (`SPEC-001/AC-n`).
- No component, jsdom, or E2E tests unless an ADR adds them.

### 8.2 Env

- Read env only through `lib/env.ts`, validated with Zod at startup.
- `NEXT_PUBLIC_*` values are public and end up in the browser bundle. Never put secrets there.
- Commit `.env.example`. Never commit `.env*.local`.

### 8.3 Docker

- Multi-stage build using Next.js `output: "standalone"`. Pinned `node:24-slim`. Non-root user. Env injected at runtime.

### 8.4 Before every commit

```bash
npm run lint
npm run test    # vitest run
npm run build   # also type-checks
```

### 8.5 Review checklist 👁️

- A page in `app/` contains fetch or form logic that belongs in a feature
- A component calls `fetch` directly or hard-codes the API URL
- Server data copied into `useState`
- A data view missing its loading, error, or empty state
- A form not using RHF + Zod, or a form losing input on error
- A raw API message shown to the user
- Delete without confirmation
- Wire types out of sync with the API spec
- An unapproved dependency added quietly
