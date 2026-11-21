# Frontend Conventions (Next.js)

> **Purpose.** How frontend code is written in this repo. Reviews check code against these rules.
>
> **Scope.** One Next.js app with the App Router and TypeScript ([ADR-0004](../../adr/0004-frontend-nextjs.md)). It talks only to the NestJS API. It has no database and no business rules of its own.
>
> **Status.** A standing rule set. A feature spec decides *what*; these files decide *how*.

## How to use

- Rules use **must** / **must not**. 👁️ marks a review-only rule. ⏳ marks a rule waiting on an open decision.
- Section numbers (§) are stable. Cite them in reviews.
- Wire rules (routes, error shape, pagination) come from the backend conventions ([§4](../backend/03-http-and-dtos.md), [§7](../backend/04-auth-and-errors.md)) and the API spec. The frontend follows them; it does not redefine them.

## Section map

| § | Topic | File |
|---|---|---|
| 1 | Architecture & folder layout | [`01-architecture.md`](01-architecture.md) |
| 2 | Naming, imports, TypeScript | [`02-code-style.md`](02-code-style.md) |
| 3–4 | API client, data & state | [`03-api-and-data.md`](03-api-and-data.md) |
| 5 | Forms & validation | [`04-forms.md`](04-forms.md) |
| 6–7 | UI components, feedback & errors | [`05-ui-and-feedback.md`](05-ui-and-feedback.md) |
| 8 | Dependencies & checks | [`06-dependencies-and-checks.md`](06-dependencies-and-checks.md) |

## What to read for a task

| Task | Files |
|---|---|
| New page or feature folder | `01`, `02` |
| Calling the API, list/search/pagination | `03` |
| Add/edit car form, image upload | `04`, `05` |
| Toasts, dialogs, error display | `05` |
| New package, lint, before commit | `06` |

## When nothing here covers it

Stop and ask. Do not invent a pattern or add a package without updating §8 first.
