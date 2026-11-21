# 02 — Naming, imports, TypeScript

> **When to read:** When creating any file.

## 2. Code style

### 2.1 Naming

| Thing | Rule | Example |
|---|---|---|
| Files, folders | `kebab-case` (except Next.js special files) | `car-form.tsx` |
| Components | `PascalCase` | `CarForm` |
| Hooks | `use-<thing>.ts`, `useThing` | `use-cars.ts` → `useCars` |
| Functions, variables | `camelCase`, descriptive | `deleteCar`, `isDeleting` |
| Types | `PascalCase`, no `I` prefix | `Car`, `CarListResponse` |
| Zod schemas | `<thing>Schema` | `carFormSchema` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_IMAGE_BYTES` |
| Booleans | `is` / `has` / `can` | `isLoading` |

### 2.2 Exports and imports

- Named exports. Use `export default` only where Next.js requires it (`page.tsx`, `layout.tsx`, ...).
- One exported component per file. Small private sub-components may stay in the same file.
- Relative imports inside a feature. Use the `@/` alias across top-level folders.
- No barrel `index.ts` files.

### 2.3 TypeScript

- `strict: true`. No `any`: use `unknown` and narrow it. No non-null `!`.
- `type` by default. Type props directly; do not use `React.FC`.
- Use `import type` for type-only imports.
- Wire types match the API spec exactly: camelCase fields, UUID strings, ISO timestamps, `null` vs omitted. 👁️
- Infer form types from Zod (`z.infer`) instead of writing them twice.
