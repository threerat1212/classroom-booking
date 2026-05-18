---
name: fullstack
description: "Cross-project implementation skill. Use when the task actively changes frontend, backend, database, shared types, or multiple apps together. Prefer planner first for scoping and lawyer-management-system first for repo-direction decisions."
argument-hint: "Describe the cross-project change to implement"
---

# Fullstack

For full workflow context, see `docs/project-workflow.md`.

Use this skill for changes that cross project boundaries.

## Typical cases

- API changes that require frontend updates
- Shared model changes across Go and TypeScript
- Backend and UI features delivered together
- Monorepo-wide cleanup that touches multiple apps

## Workflow

1. Read current patterns in each affected project.
2. Start at the owning layer of the behavior.
3. Keep shared types and API contracts aligned.
4. Validate with the narrowest useful checks before widening scope.

## Rules

- Reuse repository patterns instead of creating one-off abstractions.
- Keep API contracts explicit and synchronized across layers.
- Prefer small, verifiable edits.
- Validate the touched slice after the first substantive edit.

## DRY Foundation Gate (web/) — must follow before any FE change

When the task touches `web/`, you MUST satisfy these BEFORE writing the feature code (full rules: `web/README.md` Rules 1–10, plan: `docs/PROGRESS-TRACKER.md` 3.R):

1. **One fetcher**: All API calls go through `web/lib/http/client.ts` → `apiFetch<T>()`. No new `request<T>()`, `API_BASE`, `XxxApiError`, or duplicate token/header logic.
2. **One auth module**: `web/lib/auth/session.ts` + `useCurrentUser()`. No direct `localStorage` for auth anywhere else.
3. **shadcn-first**: For any new interactive UI primitive, run `pnpm dlx shadcn@latest add <component>` BEFORE writing custom code. Re-export via `web/components/ui/index.ts`.
4. **Canonical generics**: Tables → `web/components/data-table.tsx`; loading/empty/error → `DataTableSkeleton` / `EmptyState` / `ErrorState`; pagination → `Pagination`; row actions → `RowActions`; forms → `<FormDialog>` + `<Field>`.
5. **Standard CRUD hooks**: produced by `createCrudHooks(...)` in `web/lib/query/crud-hooks.ts`.
6. **No copy-paste verticals**: if you're about to scaffold a domain by copying another domain's files, STOP — that is the regression that caused Phase 3.R to exist. Extract shared pieces first.

If a foundation file does not yet exist, the correct response is to build it in `web/lib/` first, not to inline a duplicate in a feature file. Then the feature code becomes a thin config.

## Cross-layer consistency

- Backend money: `numeric(18,2)` serialized as string. FE renders via `<MoneyBadge>`.
- Backend status enums: keep matching TS unions in `web/types/`; render via `<StatusBadge>`.
- API error envelope `{error:{code,message}}` is parsed once by `apiFetch` into `ApiError` — never re-parse it per call site.

## web/ completion checks (mandatory when FE is touched)

```bash
cd web
pnpm lint --max-warnings=0
pnpm type-check
pnpm build
pnpm build:analyze
pnpm why @tanstack/react-query --prod
pnpm why react-hook-form --prod
pnpm why zod --prod
```

Bundle analyze output for Next.js 16 is under `.next/diagnostics/analyze`.