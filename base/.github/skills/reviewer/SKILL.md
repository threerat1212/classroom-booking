---
name: reviewer
description: "Inspection and audit skill. Use when the task is to review code for bugs, regressions, security risks, performance problems, or consistency issues. Do not use as the primary implementation skill."
argument-hint: "Describe what should be reviewed"
---

# Reviewer

For full workflow context, see `docs/project-workflow.md`.

Use this skill when the task is to inspect code rather than author it.

## Focus areas

- Behavioral regressions
- Security and data-handling risks
- Performance issues
- Project consistency and missing validation

## Workflow

1. Read the changed or requested area first.
2. Identify the highest-severity findings before anything else.
3. Prefer concrete risks over style opinions.
4. Note missing tests or validation gaps when relevant.

## Rules

- Findings come first.
- Use exact file references when possible.
- Distinguish confirmed issues from assumptions.
- Keep review output prioritized by severity.

## DRY & Reuse Gate for FE PRs (non-negotiable)

When reviewing any change that touches `web/`, check these gates against `web/README.md` Rules 1–10 and `docs/PROGRESS-TRACKER.md` section 3.R. A PR that violates any of these is a regression and should be rejected or re-scoped.

### Gate 1: One Fetcher
- [ ] No new `function request<T>()` outside `web/lib/http/client.ts`
- [ ] No new `API_BASE` constant outside the one fetcher
- [ ] No new custom `XxxApiError` class — all errors flow through `web/lib/http/error.ts` → `ApiError`
- [ ] No duplication of auth header logic (`Authorization: Bearer`, `X-User-Role`) — all live in `web/lib/http/client.ts`
- **Grep guard**: `rg "fetch\(.*api|function request<" web/lib/api/*.ts` should match 0 times outside `web/lib/http/`

### Gate 2: One Auth Module
- [ ] No new `function getStoredUser()` outside `web/lib/auth/session.ts`
- [ ] No new direct `localStorage.getItem('debt_access_token' | 'user_data')` calls outside that module
- [ ] All hooks/components reading identity use `useCurrentUser()` from `web/hooks/useCurrentUser.ts`
- **Grep guard**: `rg "function getStoredUser|localStorage.getItem.*debt|localStorage.getItem.*user_data" web/hooks/*.ts web/components/**/*.tsx` should match 0 times outside session.ts

### Gate 3: shadcn-First UI
- [ ] Any new interactive widget (Select, Dialog, Dropdown, Tabs, Form, Tooltip, etc.) has a shadcn base
- [ ] PR diff does NOT show `pnpm add shadcn/ui@...` or `npm install`; it shows existing component in `web/components/ui/`
- [ ] No re-implementation of primitives (e.g., custom Dropdown, custom Select) without shadcn as the base
- **Check**: If PR adds a new `web/components/*/XxxDropdown.tsx` or `...Select.tsx`, verify shadcn was installed first

### Gate 4: Generic Components
- [ ] All tables in `web/components/debt-management/` import from `web/components/data-table.tsx`, NOT raw `@/components/ui/table`
- [ ] No inline `loading ? <Skeleton /> : <table>...` — use `DataTable` with `loading={isLoading}` prop
- [ ] No per-component `<FieldError>` — use `<Field>` from `web/components/forms/Field.tsx`
- [ ] No duplicated loading skeleton code (5× copy-paste `<Skeleton h-12>`) — use `DataTableSkeleton`
- [ ] Pagination uses `<Pagination>` component, not inline button groups
- **Grep guard**: `rg "from '@/components/ui/table'" web/components/debt-management/` should match 0 times; `rg "function.*FieldError|<FieldError" web/components/debt-management/` should match 0 times

### Gate 5: CRUD Hooks
- [ ] Domain hook files are small config files (< 50 lines), not 120-line boilerplate
- [ ] Standard list/detail/create/update/delete is produced by `createCrudHooks(...)`, not hand-rolled per domain
- [ ] Query keys come from generic `makeKeys(domain)` in `web/lib/query/keys.ts`, not per-hook `xxxKeys` constants
- **Check**: If a new hook file is > 60 lines and not using `createCrudHooks`, ask why

### Gate 6: Forms & Validation
- [ ] Zod 4 `z.coerce.number()` workaround observed (not directly calling it; using `z.string().refine()` + manual parse)
- [ ] RHF form uses shadcn `Form` + project `<Field>` wrapper, not custom `<FieldError>` and manual `register/watch/setValue` chains

### Gate 7: Toasts & Feedback
- [ ] Every mutation has toast feedback via TanStack onSuccess/onError (not duplicated per mutation)
- [ ] Money displays via `<MoneyBadge value={...} />`, never inline `Intl.NumberFormat`
- [ ] Status displays via `<StatusBadge status={...} />`, never ad-hoc status-to-color mapping

### If Gate Violated
- Request the PR author to:
  1. Use the single source of truth (refactor to import from the core foundation file)
  2. If the foundation does not exist, point to the PROGRESS-TRACKER 3.R section and ask them to build it first
  3. Do not approve PRs that work around the gate by inlining logic that should be shared