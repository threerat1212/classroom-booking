## Management System Notice

This repository targets a Lawyer management system.

> For full workflow context, see docs/project-workflow.md.

# Web project structure guide

The active frontend is `web/`, a Next.js 16 App Router application for internal Lawyer management workflows.

## Layout

```text
web/
	app/                     App Router routes, layouts, loading, and error boundaries
	app/[lang]/              localized management routes
	components/              shared app-level components
	components/ui/           shadcn/ui primitives
	components/debt-management/ feature wrappers for debt-management verticals
	components/forms/        shared form shells and fields
	hooks/                   custom React hooks and React Query hooks
	lib/api/                 typed API functions using apiFetch
	lib/auth/                token and stored-user session helpers
	lib/http/                one HTTP fetcher and one ApiError model
	lib/query/               query-key and CRUD-hook factories
	lib/schemas/             Zod API contracts
	public/                  static assets
	types/                   shared TypeScript types
```

## Rules

- Use `apiFetch<T>()` from `web/lib/http/client.ts` for all backend HTTP calls.
- Use `web/lib/schemas/<domain>.ts` for Zod contracts and inferred types.
- Use `web/lib/api/<domain>.ts` for typed API functions.
- Use `web/hooks/use<Domain>.ts` for TanStack Query hooks.
- Use shadcn/ui primitives and shared app-level components before feature-specific UI.
- Keep page files thin and delegate interactive UI to feature components.

## Validation

```bash
cd web && pnpm lint --max-warnings=0
cd web && pnpm type-check
cd web && pnpm build
```

