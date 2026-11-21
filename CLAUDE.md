# CLAUDE.md

Haupcar take-home: a car-records website for Somchai's team (internal tool). Keep it **simple and small** — build what the scope needs, nothing more.

- Requirement: `docs/requirements/requirement-raw.pdf`
- Owner's scope analysis + wireframe: `docs/requirements/requirement-analyze.pdf`
- Conventions: `docs/conventions/backend/`, `docs/conventions/frontend/` (read the README "What to read for a task" table first)

## Scope

| Feature | Notes |
|---|---|
| Login | One fixed username/password (Somchai) |
| Car CRUD | Fields: registration no., brand, model, notes (+ image) |
| Car list | Search, filter, pagination; click a row → edit page; "Add" button → add page |
| Share | "Share" button copies a read-only link for the team |

Pages: Login → Car list → Add / Edit. That's it.

## Stack

Next.js + shadcn/ui · NestJS · PostgreSQL · MinIO (car images) · Docker Compose.

## How we work

- Claude helps write the code (time is short). Follow `docs/conventions/` — don't invent new patterns or add packages without asking.

> **Remark:** The owner designed the scope, architecture and all conventions in `docs/conventions/`, and can explain every part of the code. Because the code follows the owner's conventions, it stays consistent with the owner's own style.

- Simple over clever. No extra layers, abstractions, or features beyond the scope table.
- Familiar UX: list → edit, primary "Add" button, confirm before delete, inline field errors, loading/empty/error states.
- Small, focused git commits as we go (the requirement wants history from project start).
- Ask only when a choice really matters; otherwise pick the simple option and say so in one line.

## Docs

- Short and to the point. Bullets and tables over prose. No doc nobody will read.
- Needed for submission: a `README.md` with what it is, how to run it (`docker compose up -d --build`), and extras beyond the requirement.
- Docs in English (public repo). Reply to the owner in Thai.
