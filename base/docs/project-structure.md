# Project structure

> For full workflow context, see docs/project-workflow.md.

This repository is a Makefile-managed Lawyer management system monorepo. The active implementation targets `web/` for the management frontend, `common-api/` for the Go REST API, root `migrations/` for PostgreSQL schema changes, and `docs/` plus `.github/skills/` for shared working rules.

## Active project map

| Path | Purpose | Stack |
|------|---------|-------|
| `web/` | Main management-system frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Zod |
| `common-api/` | Backend REST API | Go 1.26, Gin, pgx/v5, PostgreSQL, sqlc, JWT, zerolog |
| `migrations/` | Shared DB migrations | golang-migrate SQL up/down files |
| `docs/` | Human and AI project guidance | Markdown |
| `.github/skills/` | AI agent skills | Markdown `SKILL.md` files |
| `.github/instructions/` | Path-scoped Copilot instructions | Markdown instructions |
| `demo-web/` | Feature inventory/reference only | Next.js demo app; do not copy implementation directly |
| `example-form-air-project/` | UI pattern reference only | Example app for tables, modals, upload, forms, and QA patterns |

## Root-level commands

```bash
make setup
make install
make db-up
make migrate-up
make sqlc
make dev-api
make dev-web
make lint
make test
make build
make validate-skills
```

## Backend layout

```text
common-api/
	cmd/api/                 API entrypoint and wiring
	db/queries/              sqlc annotated SQL
	db/sqlc/                 generated sqlc output; do not edit manually
	db/seeds/                seed SQL files
	internal/auth/           JWT token logic
	internal/config/         Viper config loading
	internal/handler/        Gin HTTP handlers
	internal/job/            in-process import/export workers
	internal/middleware/     request, auth, RBAC, audit, security middleware
	internal/model/          domain types, DTOs, errors
	internal/router/         route registration
	internal/service/        business rules and sqlc wrappers
	pkg/response/            response envelope helpers
```

## Frontend layout

```text
web/
	app/                     Next.js App Router routes and layouts
	components/              shared UI wrappers and feature components
	components/ui/           shadcn/ui primitives
	hooks/                   React Query and UI hooks
	lib/api/                 typed API functions using apiFetch
	lib/auth/                token and stored-user session helpers
	lib/http/                single HTTP fetcher and ApiError
	lib/query/               query keys and CRUD hook factory
	lib/schemas/             Zod API contract schemas
	types/                   shared TypeScript domain helpers
```

## Reference projects

`demo-web/` and `example-form-air-project/` are references. Use them to understand expected features and quality patterns, then re-derive implementation inside `web/` and `common-api/` using the project workflow.
