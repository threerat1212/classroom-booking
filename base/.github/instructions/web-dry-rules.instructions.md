---
applyTo: "web/**"
description: "DRY & reuse enforcement for the Next.js web frontend. One fetcher, one auth module, shadcn-first UI, generic components always."
---

# Web Frontend — DRY & Reuse Rules

For full workflow context, see `docs/project-workflow.md`.

All changes in `web/` must follow these rules. They exist because each one has already been violated and required a full refactor (see `docs/PROGRESS-TRACKER.md` section **3.R**).

## Rule 1 — One Fetcher, Always

- All HTTP to the backend goes through `web/lib/http/client.ts` (export: `apiFetch<T>(path, opts)`)
- **No file outside `web/lib/http/`** may call `fetch(...)` for API requests
- **No file may define** its own `request<T>()`, `API_BASE`, custom `XxxApiError`, or duplicate `Authorization` / `X-User-Role` header logic
- Auth refresh, 401 redirect, abort, retry — all live in the one fetcher
- If you need a new cross-cutting HTTP behavior, edit the fetcher; do not fork it

### Check before committing
```bash
# Should return 0 hits outside web/lib/http/
rg "fetch\(.*api" web/lib/api/*.ts web/hooks/*.ts web/components/**/*.tsx
```

---

## Rule 2 — One Auth/Session Module

- `getAccessToken`, `setAccessToken`, `clearAccessToken`, `getStoredUser`, `setStoredUser` live ONLY in `web/lib/auth/session.ts`
- React components/hooks read identity through `useCurrentUser()` from `web/hooks/useCurrentUser.ts`
- **No file may call** `localStorage.getItem('debt_access_token' | 'user_data')` directly

### Check before committing
```bash
# Should return 1 hit (the definition in session.ts)
rg "function getStoredUser" web/
```

---

## Rule 3 — shadcn-First UI

- Before building any new interactive UI, **install the shadcn primitive first**: `pnpm dlx shadcn@latest add <component>`
- Customize on top of the installed primitive
- Never re-implement a Select, Dialog, Dropdown, Tabs, Form, Tooltip, Popover, Pagination, etc. from scratch
- All UI primitives are re-exported from `web/components/ui/index.ts`. Import from `@/components/ui` (barrel) when possible

### Installed components (as of Phase 3.R)
- Alert, Badge, Button, Card, Checkbox, Dialog, Drawer, Input, Select, Skeleton, Table
- Plus: Dropdown Menu, Form, Tabs, Tooltip, Popover, Command, Separator, Radio Group, Pagination, Sonner

---

## Rule 4 — Generic Components, Always

- **Tables**: Use the canonical `DataTable` in `web/components/data-table.tsx`. No raw `<table>` or direct `@/components/ui/table` imports outside `components/data-table*`
- **Loading state**: Use `DataTableSkeleton`; never repeat `<Skeleton h-12>` blocks
- **Empty state**: Use `EmptyState` component, never inline copy
- **Error state**: Use `ErrorState` component with retry action
- **Pagination**: Use `<Pagination>` component, never inline button groups
- **Row actions**: Use `<RowActions>` powered by DropdownMenu; never inline multiple `<Button>` per row
- **Forms**: Use `<FormDialog>` + `<Field>` wrapper; never define local `<FieldError>`
- **Money display**: Always use `<MoneyBadge value={...} />`; never inline `Intl.NumberFormat`
- **Status badges**: Always use `<StatusBadge status={...} />`; never inline status-to-color mapping

### Copy-paste test
If the JSX/TS block you are about to write is structurally similar to one already in another domain folder, STOP and extract it to a shared location first.

### Check before committing
```bash
# Should return 0 hits outside components/data-table*
rg "from '@/components/ui/table'" web/components/debt-management/

# Should return 0 hits outside components/forms/Field.tsx
rg "function.*FieldError|<FieldError" web/components/debt-management/
```

---

## Rule 5 — DRY Hooks via the CRUD Factory

- Standard CRUD list/detail/create/update/delete hooks are produced by `createCrudHooks(...)` in `web/lib/query/crud-hooks.ts`
- Domain hook files should be small configuration files (< 50 lines), not 120-line boilerplate
- Query keys come from the generic `makeKeys(domain)` helper in `web/lib/query/keys.ts`
- Every mutation automatically toasts via the factory's built-in `onSuccess` / `onError` handlers

---

## Rule 6 — Forms: RHF 7 + Zod 4

- Use shadcn `Form` + project `<Field>` wrapper + `<FormDialog>` for standard form dialogs
- Never define a local `<FieldError>` component
- **Zod 4 caveat**: `z.coerce.number()` returns `unknown` and breaks the RHF resolver
  - Use `z.string().refine(...)` and coerce in `onSubmit` instead
  - This is documented and intentional; do not "fix" it back

---

## Rule 7 — Before Adding a New Feature

1. Check `web/components/` and `web/lib/` for an existing helper. If found, use/extend it.
2. Check `web/components/ui/` for the shadcn primitive. If missing, install it first.
3. Only then write feature-specific code, and keep it as thin as possible on top of the foundations.

---

## Rule 8 — CI Will Catch You

`.github/workflows/web-dry-guard.yml` runs grep-based guards on every PR. It fails the build if any of Rules 1–4 are violated. Do not bypass CI.

## Rule 9 — Completion Validation Commands

Before closing a `web/` refactor task, run:

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

For Next.js 16, analyze artifacts are emitted under `.next/diagnostics/analyze`.

---

## Related Docs

- **Implementation plan**: `docs/PROGRESS-TRACKER.md` section **3.R** (55-item refactor)
- **Foundation API reference**: See each file's JSDoc/TypeScript exports
  - `web/lib/http/client.ts` — `apiFetch<T>()`
  - `web/lib/http/error.ts` — `ApiError`, helper functions
  - `web/lib/auth/session.ts` — `getAccessToken()`, `getStoredUser()`, etc.
  - `web/hooks/useCurrentUser.ts` — `useCurrentUser()`
  - `web/lib/query/crud-hooks.ts` — `createCrudHooks(...)`
  - `web/lib/query/keys.ts` — `makeKeys(domain)`
  - `web/components/data-table.tsx` — `DataTable<T>` props
- **Skill (primary)**: `.github/skills/lawyer-management-system/SKILL.md`
- **Skill (secondary)**: `.github/skills/nextjs-app-router/SKILL.md`, `.github/skills/fullstack/SKILL.md`
- **Review checklist**: `.github/skills/reviewer/SKILL.md` (DRY & Reuse Gate section)
