---
name: implement-fe-feature
description: "Frontend feature implementation skill for the web app. Use for Next.js pages, feature components, Zod schemas, apiFetch API modules, React Query hooks, shadcn forms, tables, filters, and toasts."
argument-hint: "Describe the frontend feature or page to implement"
---

# Implement FE Feature

For full workflow context, see `docs/project-workflow.md`.

Use this skill when implementing feature UI in `web/`.

## Workflow

1. Read the route, component, schema, API, and hook patterns for the nearest existing feature.
2. Add Zod contracts in `web/lib/schemas/<domain>.ts` before UI code.
3. Add typed API calls in `web/lib/api/<domain>.ts` using `apiFetch<T>()`.
4. Add hooks in `web/hooks/use<Domain>.ts` using React Query and `makeKeys(domain)`.
5. Build feature wrappers under `web/components/debt-management/<feature>/`.
6. Keep route files under `web/app/[lang]/...` thin.
7. Verify loading, empty, error, and success states.

## Rules

- Use shared `DataTable`, `Pagination`, `RowActions`, `EmptyState`, `ErrorState`, and `DataTableSkeleton`.
- Use `FormDialog` and `Field` for forms.
- Use shadcn primitives before custom interactive UI.
- Use `MoneyBadge` and `StatusBadge` rather than inline formatting or status color maps.
- Do not add direct `fetch`, duplicate auth/session helpers, or local API error classes.

## Commands

```bash
cd web && pnpm lint --max-warnings=0
cd web && pnpm type-check
cd web && pnpm build
```
