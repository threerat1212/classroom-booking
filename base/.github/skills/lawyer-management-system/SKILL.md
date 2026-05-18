---
name: lawyer-management-system
description: "Primary repo-direction skill for this repository. Start here for Lawyer management system decisions, monorepo structure alignment, docs updates, cleanup work, admin workflows, CRUD screens, tables, forms, dashboards, and product-fit decisions. Add narrower skills only after this one when framework, testing, review, or implementation details are needed."
argument-hint: "Describe the Lawyer management task or decision"
---

# Lawyer Management System

For full workflow context, see `docs/project-workflow.md`.

Use this as the default skill for work in this repository.

## Product direction

- This project is a Lawyer management system, not a landing page or marketing site
- Prioritize operations workflows, internal tooling, and task completion speed
- Do not optimize for SEO unless the task explicitly requires it
- Prefer maintainable monorepo structure and consistent shared guidance

## Use this skill for

- Repository-wide docs alignment
- Management-system UI decisions
- Admin screens, dashboards, tables, filters, forms, and detail views
- Feature cleanup when copied code does not fit the project direction
- Structure decisions across `web/`, `common-api/`, and shared docs
- Refactors that should preserve clean architecture and remove mismatched product assumptions

## Default working rules

1. Start from existing repository patterns before introducing new abstractions.
2. Prefer management-system UX over marketing UX.
3. Prefer dense, readable information layouts over hero sections or promotional storytelling.
4. Prefer form quality, table usability, filtering, bulk actions, and clear status indicators.
5. Keep docs, skills, and implementation aligned to the same product direction.

## DRY & Reuse Gate (HARD RULE — read before writing code)

These checks come straight from `web/README.md` (Rules 1–10) and `docs/PROGRESS-TRACKER.md` section 3.R. They exist because every one of them has been violated and required a refactor.

Before adding ANY new code, answer the checklist:

1. **Fetcher**: Does this need to call the backend? → use `apiFetch<T>()` from `web/lib/http/client.ts`. Do NOT define another `request<T>()` / `API_BASE` / `XxxApiError` / token header logic. If you find yourself writing `fetch(\`${API_BASE}\`...)` you are wrong.
2. **Auth**: Need the current user or token? → use `useCurrentUser()` (hook) or `getStoredUser()`/`getAccessToken()` from `web/lib/auth/session.ts`. Do NOT call `localStorage` directly.
3. **shadcn-first UI**: Building any new interactive widget (Select, Dialog, Dropdown, Tabs, Form, Tooltip, Popover, Pagination, etc.)? → run `pnpm dlx shadcn@latest add <component>` FIRST, then customize. Do NOT re-implement primitives from scratch.
4. **Tables**: Use canonical `DataTable` from `web/components/data-table.tsx`. No raw `<table>` or direct `@/components/ui/table` imports outside `components/data-table*`. Skeleton/error/empty/pagination are built-in or handled by `DataTableSkeleton`/`ErrorState`/`EmptyState`/`Pagination`.
5. **Forms**: Use shadcn `Form` + project `<Field>` wrapper + `<FormDialog>`. Do NOT create a local `<FieldError>`. RHF 7 + Zod 4; remember the `z.coerce.number()` workaround (`z.string().refine` + manual parse).
6. **Hooks**: Standard CRUD = `createCrudHooks(...)` from `web/lib/query/crud-hooks.ts`. Domain hook files should be tiny config files, not 120-line boilerplate.
7. **Toasts**: Every mutation toasts via the factory's `onSuccess`/`onError`. Do not re-write toast lines per hook.
8. **Money/Status**: Use `<MoneyBadge>` and `<StatusBadge>`. No inline `Intl.NumberFormat` or per-file status-color tables.
9. **Copy-paste test**: If the JSX/TS block you are about to write is structurally similar to one already in another domain folder, STOP and extract it to a shared location first.
10. **CI guard**: `.github/workflows/web-dry-guard.yml` will fail PRs that break Rules 1–4. Don't bypass.

If a rule blocks your task because the foundation does not exist yet, BUILD the foundation first (PROGRESS-TRACKER 3.R), do not work around it by duplicating.

## UI guidance

- Favor dashboards, worklists, detail panes, and modal or drawer workflows only when they improve operations flow
- Make primary actions explicit and easy to scan
- Optimize for CRUD, review, approval, tracking, and reporting flows
- Prefer clarity, state visibility, and predictable navigation over visual novelty

## Architecture guidance

- Keep shared rules in root `.github/`
- Avoid duplicating the same guidance in multiple project folders unless it must be path-specific
- Use narrower skills as secondary support for framework, testing, or language-specific work

## Combine with other skills when needed

- `planner` for scoping and file discovery
- `fullstack` for cross-project implementation
- `reviewer` for audits and findings
- `ai-agent-testing` for browser QA
- `nextjs-app-router` or `typescript-best-practices` for stack-specific constraints

## Required verification for web DRY completion

When a task finishes a `web/` refactor slice, run:

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

Use `.next/diagnostics/analyze` (Next.js 16) as the bundle analysis output location.