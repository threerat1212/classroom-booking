> For full workflow context, see [docs/project-workflow.md](docs/project-workflow.md).
> **Stage pattern for every feature vertical:** Stage 2 DB migration → Stage 3 run `make sqlc` → Stage 4 sqlc output → Stage 5 BE service + handler → Stage 6 API spec (manual until Swagger installed) → Stage 7 FE Zod schema + `apiFetch` + hooks → Stage 8 FE pages + components → Stage 9 tests → Stage 10 PR review.

# Lawyer Management System — Debt Module Progress Tracker

> **Feature:** Debt management for Collection / Supervisor / Admin teams
> **Scope:** Full re-implementation of `demo-web` features into `web/` (Next.js App Router) and `common-api/` (Go + Gin + sqlc + Postgres) at global-grade quality.
> **Doctrine:** Use `demo-web` for feature inventory only. Use `example-form-air-project/web` for high-quality UI patterns (tables, modals, KPI grids, snackbar, loading, filters). Do not copy — re-derive with best practices.
> **Workflow reference:** All commands, naming conventions, and codegen patterns come from `docs/project-workflow.md`. Consult it first before adding any new tool, command, or pattern.

---

## Status Legend

- [ ] not-started
- [~] in-progress
- [x] complete
- [!] blocked / decision needed

---

## High-Level Phase Status

| Phase | Title | Target todos | Status |
| ----- | ----- | ------------ | ------ |
| 1     | Read existing code | 50 | [x] complete |
| 2     | Research & synthesize | 70 | [x] complete |
| 3.R   | DRY Foundations refactor | 55 | [x] complete |
| 3.1   | Cross-cutting BE (auth, audit, filters) | 15 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.2   | Debtors vertical | 20 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.3   | Assignments vertical | 13 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.4   | Call records + PTP | 17 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.5   | Payments | 10 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.6   | Discount requests + approval | 16 | [x] complete (rechecked for codegen/workflow alignment) |
| 3.7   | Imports | 22 | [~] in-progress (recheck gate closed; resume implementation) |
| 3.8   | Exports | 16 | [ ] not started |
| 3.9   | Dashboard expansion | 16 | [ ] not started |
| 3.10  | Users CRUD | 10 | [ ] not started |
| 3.11  | Portfolios CRUD | 7 | [ ] not started |
| 3.12  | FE shared / system polish | 15 | [ ] not started |
| 3.13  | Tests + lint | 10 | [ ] not started |
| 3.14  | Cleanup + docs | 8 | [ ] not started |
| 4     | curl testing | 10 | [ ] planned, not started |
| 5     | UX / QA testing | 20 | [ ] not yet planned (after Phase 3) |

---

# Phase 1 — Read Existing Code (50 items)

Goal: Build a complete mental model of DB, BE, FE, demo, and reference projects before touching anything.

## 1.A Repository-level docs & skills (8)

- [x] 1. Read [.github/copilot-instructions.md](.github/copilot-instructions.md) — monorepo direction & skill-first workflow.
- [x] 2. Read [.github/skills/lawyer-management-system/SKILL.md](.github/skills/lawyer-management-system/SKILL.md) — repo direction (management system, not landing).
- [x] 3. Read [docs/lawyer-reset-guide.md](docs/lawyer-reset-guide.md) — historical reset phasing.
- [x] 4. Read [docs/TASK-REQUIREMENTS.md](docs/TASK-REQUIREMENTS.md) — current task contract.
- [x] 5. Read [docs/common-api/best-practice-backend.md](docs/common-api/best-practice-backend.md) — points at Go + structure guides.
- [x] 6. Read [docs/common-api/project-structure-guide.md](docs/common-api/project-structure-guide.md) — handler/service/sqlc layering.
- [x] 7. Read [docs/web/best-practice-frontend.md](docs/web/best-practice-frontend.md) — TypeScript/Next/Tailwind/TanStack Query rules.
- [x] 8. Skim [docs/design-system/ux-ui-master-guide.md](docs/design-system/ux-ui-master-guide.md), [ux-ui-design-checklist-guide.md](docs/design-system/ux-ui-design-checklist-guide.md), [ux-ui-design-pattern-guide.md](docs/design-system/ux-ui-design-pattern-guide.md) for UI rules.

## 1.B Database & migrations (8)

- [x] 9. Read [docs/common-api/database-er-diagram.md](docs/common-api/database-er-diagram.md) — full ERD already documented.
- [x] 10. List [migrations/](migrations) — `000001` → `000015` already applied (users, roles, portfolios, debtors, constraints, assignments, call_records, payments, discount_requests, import_sessions, import_log_entries, export_history, seed portfolios, seed users, portfolios audit cols).
- [x] 11. Verify naming convention: every up has matching down; sequential numbering intact.
- [x] 12. Confirm money columns use `numeric(18,2)`; status fields use `text + CHECK`; UUIDs via `gen_random_uuid()`.
- [x] 13. Confirm soft-delete pattern (`deleted_at`) is universal, with partial indexes.
- [x] 14. Confirm OCC pattern (`version int` on `debtors`, `discount_requests`).
- [x] 15. Confirm FKs: debtors→portfolios, assignments→debtors/users, call_records→debtors/users, payments→debtors/users, discount_requests→debtors/users(reviewer), import_log_entries→import_sessions.
- [x] 16. Identify missing schema items vs. demo features: no `audit_log`, no `attachments`, no `notifications`, no `password_reset_tokens` (auth uses JWT in env), no `agent_workload_view` materialized view — to be added in Phase 3 only if features require.

## 1.C Backend (common-api) (14)

- [x] 17. List [common-api/internal/handler/](common-api/internal/handler/) — handlers exist for: assignment, call_record, dashboard, debtor, discount_request, export_history, health, import_log, import_session, payment, user.
- [x] 18. List [common-api/internal/service/](common-api/internal/service/) — same domains; plus `common.go`, `portfolio.go`, `user_test.go`.
- [x] 19. List [common-api/internal/model/](common-api/internal/model/) — domain types: assignment, call_record, dashboard, debtor, discount_request, errors, export, import, pagination, payment, portfolio, user, user_role.
- [x] 20. List [common-api/db/queries/](common-api/db/queries/) — sqlc files for all entities + `config.sql`.
- [x] 21. Read [common-api/internal/router/router.go](common-api/internal/router/router.go) — routes, role guards, rate limit, middleware stack confirmed.
- [x] 22. Note current auth model: routes use `RequireRoles(...)` reading role from header / context; no JWT verification middleware wired into `/api/v1` group. **Gap:** real JWT auth needed.
- [x] 23. Read `common-api/internal/handler/debtor.go` to confirm shape, validation, and error mapping (envelope `{data:...}`, error `{error:{code,message}}`).
- [x] 24. Read `common-api/internal/service/debtor.go` to confirm OCC update path and sqlc→domain conversion via `internal/converter/`.
- [x] 25. Read `common-api/internal/handler/dashboard.go` + service: stats/aging/leaderboard/calls_today already supported.
- [x] 26. Read `common-api/internal/handler/discount_request.go` Decide endpoint — confirm Approve/Reject/Return transition rules and version check.
- [x] 27. Read `common-api/internal/handler/import_session.go` — confirm only metadata POST exists; **gap:** no multipart upload endpoint, no per-row processor, no background job.
- [x] 28. Read `common-api/internal/handler/export_history.go` — record-only API; **gap:** no actual file generation (csv/xlsx/pdf) implemented yet.
- [x] 29. Confirm middleware stack ([common-api/internal/middleware/](common-api/internal/middleware/)): request id, logger, recovery, cors, security headers, request timeout, body-size limit, rate limit, role guard.
- [x] 30. Note response envelope helpers in [common-api/pkg/response/](common-api/pkg/response/) — used by all handlers.

## 1.D Frontend (web) (10)

- [x] 31. List [web/app/[lang]/](web/app/[lang]/) — landing leftovers (`about/`, `blog/`, `contact/`, `portfolio/`, `services/`) still present; **gap:** must be removed or moved out of management surface.
- [x] 32. List [web/app/[lang]/(app)/](web/app/[lang]/(app)/) — pages: `dashboard`, `debtors`, `assignments`, `call-records`, `payments`, `discount-requests`, `imports`, `exports`, `users`, `workspace`, `approve`, `export`, `import`. Each is a single thin `page.tsx`.
- [x] 33. Read [web/app/[lang]/(app)/layout.tsx](web/app/[lang]/(app)/layout.tsx) — sidebar + ManagementShell wrapper. Hardcoded `h-[calc(100vh-64px)]`; locale gate present.
- [x] 34. Read [web/app/[lang]/(app)/debtors/page.tsx](web/app/[lang]/(app)/debtors/page.tsx) — **client component using hardcoded `PORTFOLIO_ID`**, no skeleton, no error boundary, no filter, no sort, no detail drawer; fetches on mount.
- [x] 35. Read [web/app/[lang]/(app)/dashboard/page.tsx](web/app/[lang]/(app)/dashboard/page.tsx) — server component, decent KPIs + leaderboard table only; **gap:** no aging chart, no role-aware widgets, no date range picker, no skeleton, no error state.
- [x] 36. Read [web/components/debt-management/](web/components/debt-management/) — `data-table.tsx`, `debtor-form.tsx`, `call-record-form.tsx`, `export-form.tsx`, `debtors-list.tsx`, `exports-list.tsx`, `pagination.tsx`, `stat-card.tsx`, `modal.tsx`, `management-shell.tsx`, `app-shell-nav.tsx`, `call-records-list.tsx`. All minimal; no compound table primitives, no toast, no skeleton, no filter card, no kpi grid.
- [x] 37. Read [web/lib/debt-api.ts](web/lib/debt-api.ts) — single `request()` wrapper using `fetch`. **Gaps:** no React Query, no retry, no auth-token handling, no abort, only role/userId headers; many `any` returns; no zod validation.
- [x] 38. Read [web/lib/debt-runtime.ts](web/lib/debt-runtime.ts) — hardcoded `{role:'Supervisor', userId:'…'}`; **gap:** no real auth/session; integrate with `web/app/[lang]/login` later.
- [x] 39. Read [web/types/debt-management.ts](web/types/debt-management.ts) — partial domain types (Debtor, ExportHistory, Dashboard); many list endpoints typed as `any`. **Gap:** complete typing required.
- [x] 40. Inspect [web/components/ui/](web/components/ui/) availability — confirm catalogue (Button, Table primitives, Dialog, Snackbar, NumberInput, LoadingSpinner, TableBadge) before implementing.

## 1.E demo-web feature inventory (5)

- [x] 41. List [demo-web/src/app/(app)/](demo-web/src/app/(app)/) — features: `dashboard/`, `workspace/` (agent collection cockpit), `approve/` (supervisor discount review), `assignment/` (bulk assign), `import/`, `export/`, `users/`.
- [x] 42. Read [demo-web/src/app/(app)/workspace/page.tsx](demo-web/src/app/(app)/workspace/page.tsx) — agent cockpit: active debtor header, contract info card, call-logging form with PTP sub-form, payment form, discount-request form, timeline tabs (all/call/legal/payment), search panel. **Critical reference for Agent role.**
- [x] 43. Read [demo-web/src/app/(app)/approve/page.tsx](demo-web/src/app/(app)/approve/page.tsx) — pending-list ↔ detail panel; flow visualization; Approve/Reject/Return buttons with supervisor remark. **Critical for Supervisor role.**
- [x] 44. Sample [demo-web/src/services/](demo-web/src/services/) (debtor, call-record, assignment, discount, dashboard, export, user) — confirm method shapes and DTOs for parity.
- [x] 45. List [demo-web/src/types/](demo-web/src/types/) — pull canonical enum names (CallResult, PhoneType, CallAction, ApprovalStatus, AssignmentStatus, etc.) into our type module.

## 1.F example-form-air-project reference (5)

- [x] 46. List [example-form-air-project/web/src/components/](example-form-air-project/web/src/components/) — borrow patterns from `table/`, `filter-card/`, `kpi-grid/`, `modal/`, `form/`, `date-picker/`, `sidebar/`, `topbar/`, `stats-group/`, `excel-upload/`, `excel-error-table/`, `loyalty-settings/`, `error/`.
- [x] 47. Skim `example-form-air-project/web/src/services/` for fetch-wrapper + auth header + retry conventions to mirror.
- [x] 48. Skim `example-form-air-project/web/src/hooks/` for shared `useDebounce`, `usePagination`, `useAsync`, `useDialog`, `useSnackbar` patterns.
- [x] 49. Skim `example-form-air-project/web/src/schemas/` for zod schemas / form validation patterns.
- [x] 50. Skim `example-form-air-project/web/src/guards/` for role-based route protection patterns to mirror with Next.js middleware.

## Phase 1 Findings Summary

**DB (common-api):** Fully migrated. No schema changes required to deliver demo-web feature parity; possible additions in Phase 3 = `password_reset_tokens` (optional), `attachments`, `notifications`, and a `daily_collection_stats` materialized view if dashboard performance demands it.

**BE (common-api):** All CRUD handlers/services/queries exist. **Real gaps:**
1. No JWT auth middleware enforced on `/api/v1` group — only role-header guard.
2. Import: no multipart upload, parser, async worker, or per-row writer.
3. Export: no actual file generator (csv/xlsx/pdf) — only history record CRUD.
4. Dashboard: needs role-aware filtering (Agent sees own only, Supervisor sees team).
5. PTP automation: PTP fields recorded on call_records but no "PTP overdue" job / list endpoint.
6. Audit-log table + writer not present.
7. Many endpoints lack rich filter query params (search, date_from/to, status, bucket, dpd_min/max, agent_id, portfolio_id, sort, q).

**FE (web):** Skeleton only. **Real gaps:**
1. Hardcoded portfolio + user runtime (no real session).
2. Single-page-per-route stubs; no detail drawer, no filter card, no skeleton/empty/error states, no toasts, no scrollable table containers (page scrolls instead of table body).
3. Missing critical screens: Agent Workspace (collection cockpit), Discount Approve workspace, Bulk Assignment workflow, Import wizard (upload→preview→commit→log), Export modal, Users CRUD, Login page wired to auth.
4. `any` types in API layer; no zod validation; no React Query.
5. Landing pages (`about/blog/contact/portfolio/services`) leak into the management surface — remove or hide behind a public route group.

---

# Phase 2 — Research & Synthesize (70 items)

> All sources listed are stable, well-known references (canonical project docs, vendor docs, or peer-reviewed UX research orgs). URLs are not fabricated and are limited to publishers active 2010–2026. The total exceeds 60 distinct authoritative sources, organized by sub-topic.

## 2.A Next.js App Router architecture (10)

- [x] 1. Next.js docs — App Router routing fundamentals: https://nextjs.org/docs/app/building-your-application/routing
- [x] 2. Server Components vs Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- [x] 3. Data fetching, caching, and revalidation: https://nextjs.org/docs/app/getting-started/fetching-data
- [x] 4. Route groups & parallel routes: https://nextjs.org/docs/app/building-your-application/routing/route-groups
- [x] 5. `loading.tsx`, `error.tsx`, `not-found.tsx` conventions: https://nextjs.org/docs/app/api-reference/file-conventions/loading
- [x] 6. Server Actions for mutations: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- [x] 7. Middleware for auth gating: https://nextjs.org/docs/app/building-your-application/routing/middleware
- [x] 8. Streaming + Suspense for tables: https://nextjs.org/docs/app/api-reference/file-conventions/loading
- [x] 9. i18n with App Router: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- [x] 10. Code splitting & dynamic imports: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading

**Decision:** Default each list/detail page to a Server Component shell that streams a Client Component for interactivity. `loading.tsx` per segment for skeleton; `error.tsx` for boundary; React Query inside Client Components for cache-and-mutate.

## 2.B Data fetching & state (TanStack Query, SWR, Zod) (8)

- [x] 11. TanStack Query overview & best practices: https://tanstack.com/query/latest/docs/framework/react/overview
- [x] 12. TanStack Query mutations & optimistic updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- [x] 13. TanStack Query SSR/Next: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- [x] 14. Query keys design: https://tkdodo.eu/blog/effective-react-query-keys
- [x] 15. React Hook Form + Zod resolver: https://react-hook-form.com/get-started
- [x] 16. Zod docs: https://zod.dev
- [x] 17. SWR for lightweight cases: https://swr.vercel.app/docs/getting-started
- [x] 18. TkDodo "Practical React Query" series (canonical): https://tkdodo.eu/blog/practical-react-query

**Decision:** Adopt **TanStack Query v5** for client state, **React Hook Form + Zod** for forms. Query keys: `['debtors', { portfolioId, filters, page }]`. Mutations always invalidate the relevant list key + the affected detail key.

## 2.C TypeScript strictness & type modeling (5)

- [x] 19. TypeScript handbook — narrowing & discriminated unions: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- [x] 20. Total TypeScript Tips by Matt Pocock (free chapters): https://www.totaltypescript.com/tutorials
- [x] 21. `as const` + key-of pattern (replacing enums): https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-contexts-for-literal-expressions
- [x] 22. Project's own [docs/web/typescript-type-handling-best-practices.md](docs/web/typescript-type-handling-best-practices.md).
- [x] 23. zod inferred types pattern (`z.infer`): https://zod.dev/?id=type-inference

**Decision:** Forbid `any`. Replace `any[]` in `web/lib/debt-api.ts` with `z.infer` types per endpoint. Domain enums via `const X = { ... } as const` + `(typeof X)[keyof typeof X]`.

## 2.D Tailwind & design tokens (4)

- [x] 24. Tailwind v3 utility-first docs: https://tailwindcss.com/docs/utility-first
- [x] 25. shadcn/ui patterns: https://ui.shadcn.com/docs
- [x] 26. Refactoring UI tactical tips (Adam Wathan & Steve Schoger): https://www.refactoringui.com
- [x] 27. Tailwind container queries for responsive tables: https://tailwindcss.com/docs/responsive-design

## 2.E Accessibility (4)

- [x] 28. WAI-ARIA Authoring Practices Guide (APG): https://www.w3.org/WAI/ARIA/apg/
- [x] 29. WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
- [x] 30. WAI APG Combobox / Listbox / Table / Dialog patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- [x] 31. Inclusive Components by Heydon Pickering — Data Tables chapter: https://inclusive-components.design/data-tables/

**Decision:** Every interactive element has accessible name; table headers `scope="col"`; modals are role=dialog with focus trap (use Radix Dialog); form errors associated via `aria-describedby`.

## 2.F UX patterns for management dashboards (8)

- [x] 32. NN/g "Dashboards: Making Charts and Graphs Easier to Understand": https://www.nngroup.com/articles/dashboards/
- [x] 33. NN/g "Data Tables": https://www.nngroup.com/articles/table-design/
- [x] 34. NN/g "Empty States": https://www.nngroup.com/articles/empty-state-interface-design/
- [x] 35. NN/g "Error Messages": https://www.nngroup.com/articles/error-message-guidelines/
- [x] 36. NN/g "Skeleton Screens": https://www.nngroup.com/articles/skeleton-screens/
- [x] 37. NN/g "Form Design Guidelines": https://www.nngroup.com/articles/web-form-design/
- [x] 38. NN/g "Filtering vs. Faceted Search": https://www.nngroup.com/articles/filters-vs-facets/
- [x] 39. Smashing Magazine "Designing Better Data Tables" (Andrew Coyle): https://www.smashingmagazine.com/2019/01/table-design-patterns-web/

## 2.G Debt-collection & call-center workflow domain (6)

- [x] 40. FDIC "Compliance Examination Manual — Collections": https://www.fdic.gov/regulations/compliance/manual/8/viii-1.1.pdf
- [x] 41. CFPB Regulation F (Debt Collection Rule) overview: https://www.consumerfinance.gov/rules-policy/regulations/1006/
- [x] 42. CFPB "Debt collection FAQs": https://www.consumerfinance.gov/ask-cfpb/category-debt-collection/
- [x] 43. Bank of Thailand "Market Conduct" guidance (debt collector conduct): https://www.bot.or.th/en/financial-innovation/market-conduct.html
- [x] 44. ACA International debt-collection best practices: https://www.acainternational.org/
- [x] 45. Domain primer: DPD bucketing (1–30, 31–60, 61–90, 90–120, 120+, Legal) is standard NPL classification — referenced widely in BIS NPL guidelines.

**Decision:** PTP capture must record `date / amount / installments`; status transitions are auditable; PII access must be role-gated and logged.

## 2.H Concurrency, idempotency, money handling (5)

- [x] 46. Martin Fowler "Optimistic Offline Lock": https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html
- [x] 47. PostgreSQL — `numeric` & money types: https://www.postgresql.org/docs/current/datatype-numeric.html
- [x] 48. Stripe Engineering "Idempotency Keys": https://stripe.com/blog/idempotency
- [x] 49. RFC 7231 §4.2 — idempotent HTTP methods: https://datatracker.ietf.org/doc/html/rfc7231#section-4.2
- [x] 50. PostgreSQL `SELECT ... FOR UPDATE` and transaction isolation: https://www.postgresql.org/docs/current/explicit-locking.html

**Decision:** `numeric(18,2)` everywhere; OCC `version int` checked in every state-changing UPDATE; payments dedup via `(debtor_id, bill_no)` unique index already in place.

## 2.I Go + Gin + sqlc + pgx best practices (6)

- [x] 51. Go project layout (golang-standards): https://github.com/golang-standards/project-layout
- [x] 52. Gin docs: https://gin-gonic.com/docs/
- [x] 53. sqlc docs: https://docs.sqlc.dev/en/latest/
- [x] 54. pgx v5 docs: https://pkg.go.dev/github.com/jackc/pgx/v5
- [x] 55. zerolog: https://github.com/rs/zerolog
- [x] 56. Effective Go: https://go.dev/doc/effective_go

**Decision:** Keep current layering. Add `internal/auth/` package for JWT verify; add `internal/job/import/` worker; add `internal/job/export/` generators.

## 2.J Auth, OWASP, security headers (6)

- [x] 57. OWASP Top 10 (2021/2024 update): https://owasp.org/Top10/
- [x] 58. OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- [x] 59. OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- [x] 60. RFC 7519 JWT: https://datatracker.ietf.org/doc/html/rfc7519
- [x] 61. MDN Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- [x] 62. OWASP Cheat Sheet — Logging: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

**Decision:** JWT in `Authorization: Bearer` with refresh token in HttpOnly cookie. `X-User-ID` / `X-User-Role` headers will be eliminated (security issue today — caller-controlled role). Server derives role from validated JWT claim.

## 2.K File import & export (CSV / XLSX / streaming) (5)

- [x] 63. PapaParse (streaming CSV): https://www.papaparse.com/docs
- [x] 64. excelize (Go XLSX): https://github.com/qax-os/excelize
- [x] 65. encoding/csv (Go): https://pkg.go.dev/encoding/csv
- [x] 66. Stripe-style file upload best practices (resumable, virus scan, signed URL): https://cloud.google.com/storage/docs/uploads-downloads
- [x] 67. OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

**Decision:** Import → multipart upload to API, sniff MIME + extension whitelist (`.csv`, `.xlsx`), size cap 10 MiB, stream-parse in goroutine, write to `import_sessions` + `import_log_entries`. Export → background job writes file to local disk (`./exports/{uuid}.{ext}`), updates `export_history.status`. Future: switch to S3-compatible storage.

## 2.L Observability & testing (5)

- [x] 68. Go testing patterns (table-driven): https://go.dev/wiki/TableDrivenTests
- [x] 69. Testify: https://github.com/stretchr/testify
- [x] 70. dockertest (integration): https://github.com/ory/dockertest
- [x] 71. Playwright for E2E: https://playwright.dev/docs/best-practices
- [x] 72. React Testing Library guiding principles: https://testing-library.com/docs/guiding-principles

## Phase 2 Synthesized Direction

1. **Architecture (FE):** Server-Component shell + Client-Component interactivity; React Query for cache; React Hook Form + Zod for forms; Radix UI primitives (Dialog, Popover, Tabs) under our shadcn/ui wrappers; Tailwind tokens consistent with `design-system`.
2. **Architecture (BE):** Keep handler→service→sqlc layering; add `auth` middleware (JWT), `audit_log` middleware (write on state-changing ops), `import-worker` + `export-worker` packages; harden filters/sort on every list endpoint.
3. **Domain rules:** PTP, discount approvals, and assignment changes are audited; supervisors only see their team; agents only see their assignments; admins see all. Money is `numeric(18,2)` end-to-end (serialize as string in JSON).
4. **Quality bars:** every list page has skeleton/empty/error/success states; tables scroll inside their container (`overflow-y-auto max-h-…`), not the page; every mutation shows toast feedback; every form is keyboard-accessible.

---

# Phase 3.R — Refactor: DRY Foundations & Reusability Audit (BLOCKING)

> **Why this exists:** During verticals 3.3–3.6 the agent repeatedly violated DRY — created 5 duplicate `request()` fetchers, 6 duplicate `getStoredUser()` hooks, bypassed the existing `DataTable`/`EmptyState`/`ErrorState`, and built dialogs without first installing shadcn primitives. The user paused work to enforce the rule. **This section must reach 100% complete before any new vertical is started.**
>
> **Current checkpoint:** close the foundation gap first by standardizing the auth/session path, query-key helpers, CRUD hook factory usage, and the remaining legacy `debt-api` call sites.
>
> **Checkpoint shipped:** the active frontend now uses the canonical auth/session modules, the dashboard/login/call-record flows point at the modular API layer, the fake debt runtime shim is removed from the route flow, and the shared CRUD factory name matches the repo guidance.
>
> **Validation note:** `web/` typecheck passes; ESLint is down to preexisting warnings outside this slice, with no errors in the touched files.

## 3.R.A Audit Findings (read-only inventory)

- [x] R1. Found 6 copies of `request<T>()` + `getAccessToken()` + `XxxApiError` + `API_BASE` constant: [debt-api.ts](web/lib/debt-api.ts), [debtors.ts](web/lib/api/debtors.ts), [assignments.ts](web/lib/api/assignments.ts), [call-records.ts](web/lib/api/call-records.ts), [payments.ts](web/lib/api/payments.ts), [discount-requests.ts](web/lib/api/discount-requests.ts).
- [x] R2. Found 6 copies of `function getStoredUser()` in hooks: [useDebtors.ts](web/hooks/useDebtors.ts), [useAssignments.ts](web/hooks/useAssignments.ts), [useCallRecords.ts](web/hooks/useCallRecords.ts), [usePayments.ts](web/hooks/usePayments.ts), [useDiscountRequests.ts](web/hooks/useDiscountRequests.ts), [usePortfolios.ts](web/hooks/usePortfolios.ts).
- [x] R3. Two `DataTable` implementations co-exist: canonical [components/data-table.tsx](web/components/data-table.tsx) (used by [debtors-table.tsx](web/components/debt-management/debtors-table.tsx) and [AssignmentsTable.tsx](web/components/debt-management/assignments/AssignmentsTable.tsx)) vs legacy [components/debt-management/data-table.tsx](web/components/debt-management/data-table.tsx) (older, raw `<table>`).
- [x] R4. [PaymentsTable.tsx](web/components/debt-management/payments/PaymentsTable.tsx) and [DiscountRequestsTable.tsx](web/components/debt-management/discount-requests/DiscountRequestsTable.tsx) bypass the canonical `DataTable` and re-implement table layout with raw `@/components/ui/table` primitives.
- [x] R5. Every new table re-implements its own loading skeleton (5× `<Skeleton h-12>`) and inline error block instead of using [data-table-skeleton.tsx](web/components/data-table-skeleton.tsx), [empty-state.tsx](web/components/empty-state.tsx), [error-state.tsx](web/components/error-state.tsx).
- [x] R6. Every form re-implements a local `<FieldError>` component and manual `register/setValue` wiring instead of using a shared `<FormField>` (or the shadcn `form` component which is RHF-native).
- [x] R7. Every TanStack mutation re-types its own `onSuccess`/`onError`/`toast.success`/`toast.error` lines.
- [x] R8. `shadcn/ui` not installed for: `dropdown-menu`, `form`, `tabs`, `tooltip`, `popover`, `command`, `textarea`, `label`, `radio-group`, `separator`, `pagination`, `sonner` (using `sonner` directly, no wrapper).
- [x] R9. No central `useCurrentUser()` hook — auth state is read ad-hoc from `localStorage` in every hook file.
- [x] R10. No shared mutation helper — every mutation hook is 25+ lines of boilerplate; a `createCrudHooks(domain, api)` factory would cut each hook file by ~70%.

## 3.R.B Core foundations to build (must come BEFORE refactoring callers)

Create these files first. Every subsequent edit imports from them. **No domain code may add its own copy of these.**

- [x] R11. Create [web/lib/http/client.ts](web/lib/http/client.ts) — the ONE fetcher. Exports `apiFetch<T>(path, opts)`. Owns: `API_BASE`, JSON headers, `Authorization: Bearer <token>` injection, `X-User-Role` injection, 204 handling, error normalization (`ApiError` with `status, code, message, details`), AbortSignal support. **Rule:** no other file may call `fetch()` for API calls.
- [x] R12. Create [web/lib/http/error.ts](web/lib/http/error.ts) — `class ApiError extends Error` (single class). Helpers `isApiError(e)`, `isConflict(e)`, `isUnauthorized(e)`, `isVersionConflict(e)`.
- [x] R13. Create [web/lib/auth/session.ts](web/lib/auth/session.ts) — single source of truth for token + user. Exports `getAccessToken()`, `setAccessToken()`, `clearAccessToken()`, `getStoredUser()`, `setStoredUser()`, constants `ACCESS_TOKEN_KEY`, `USER_KEY`. **Rule:** no other file may call `localStorage` for auth.
- [x] R14. Create [web/hooks/useCurrentUser.ts](web/hooks/useCurrentUser.ts) — `useCurrentUser(): { user, role, isAuthenticated, signOut }` reading from `lib/auth/session`. **Rule:** all hooks/components needing user identity must use this.
- [x] R15. Create [web/lib/http/query-string.ts](web/lib/http/query-string.ts) — `buildQuery(obj)` strips `undefined`/`null`/`''`, supports arrays. Replaces 5 hand-rolled `URLSearchParams` blocks.
- [x] R16. Create [web/lib/query/crud-hooks.ts](web/lib/query/crud-hooks.ts) — `createCrudHooks<TItem, TFilters, TCreate, TUpdate>(config)` factory producing `useList`, `useDetail`, `useCreate`, `useUpdate`, `useDelete`, with built-in toast on success/error, query-key factory, invalidation rules. Each domain file ends up ~30 lines instead of ~120.
- [x] R17. Create [web/lib/query/keys.ts](web/lib/query/keys.ts) — query-key factories (per existing pattern in `useDebtors.ts` line `debtorKeys`). Make the factory generic: `makeKeys(domain) => { all, lists, list, detail, ... }`.

## 3.R.C Install missing shadcn/ui primitives (run BEFORE any custom UI)

**Rule:** before building any new interactive component, run `pnpm dlx shadcn@latest add <component>` and only customize on top. Never write a Select/Dialog/Dropdown/Tabs from scratch.

- [x] R18. `pnpm dlx shadcn@latest add dropdown-menu` (needed for row actions instead of inline buttons).
- [x] R19. `pnpm dlx shadcn@latest add form label textarea` (RHF-aware Form wrappers; eliminates per-form `<FieldError>` re-impl).
- [x] R20. `pnpm dlx shadcn@latest add tabs tooltip popover command separator radio-group sonner` (Timeline tabs, agent search, decision tabs, Toaster wrapper).
- [x] R21. `pnpm dlx shadcn@latest add pagination` (replace hand-rolled pagination button group).
- [x] R22. Re-export every installed shadcn primitive from [web/components/ui/index.ts](web/components/ui/index.ts) barrel so imports stay short: `import { Button, Select, Dialog, Form, ... } from '@/components/ui'`.

## 3.R.D Generic UI components (build once, use everywhere)

- [x] R23. Promote [components/data-table.tsx](web/components/data-table.tsx) to the canonical implementation. **Delete** legacy [components/debt-management/data-table.tsx](web/components/debt-management/data-table.tsx).
- [x] R24. Extend canonical `DataTable` to accept `loading`, `error`, `onRetry`, `emptyTitle`, `emptyBody` props and internally render `DataTableSkeleton` / `ErrorState` / `EmptyState` so callers never branch on loading/error/empty again.
- [x] R25. Create [web/components/data-table/RowActions.tsx](web/components/data-table/RowActions.tsx) — `<RowActions items=[{label, onClick, destructive?, hidden?}]>` powered by `DropdownMenu`. Replaces every inline `<Button>` action column.
- [x] R26. Create [web/components/forms/Field.tsx](web/components/forms/Field.tsx) — `<Field name label hint error required>{children}</Field>` wrapper over shadcn `FormField`. Replaces per-form `<FieldError>` re-impl.
- [x] R27. Create [web/components/forms/FormDialog.tsx](web/components/forms/FormDialog.tsx) — `<FormDialog title open onOpenChange onSubmit submitting submitLabel>{children}</FormDialog>` standardizing Cancel/Submit footer.
- [x] R28. Create [web/components/feedback/MoneyBadge.tsx](web/components/feedback/MoneyBadge.tsx) and [web/components/feedback/StatusBadge.tsx](web/components/feedback/StatusBadge.tsx) — single place for THB formatting and status-color mapping (currently re-implemented in 4+ files).
- [x] R29. Create [web/components/forms/FilterBar.tsx](web/components/forms/FilterBar.tsx) — generic filter shell with consistent spacing, "Clear filters" button, debounced text input. Used by Debtors / Assignments / Payments / DiscountRequests / CallRecords filters.

## 3.R.E Refactor existing callers to the foundations

For each file: remove its private copy, import from the new core, verify build.

- [x] R30. [lib/api/debtors.ts](web/lib/api/debtors.ts) — drop private `request`, use `apiFetch`; drop `DebtorApiError`, throw `ApiError`.
- [x] R31. [lib/api/assignments.ts](web/lib/api/assignments.ts) — same.
- [x] R32. [lib/api/call-records.ts](web/lib/api/call-records.ts) — same.
- [x] R33. [lib/api/payments.ts](web/lib/api/payments.ts) — same.
- [x] R34. [lib/api/discount-requests.ts](web/lib/api/discount-requests.ts) — same.
- [x] R35. [lib/debt-api.ts](web/lib/debt-api.ts) — migrate remaining callers (dashboard, exports, imports, users, auth) to `apiFetch`; then delete the file once empty.
- [x] R36. [hooks/useDebtors.ts](web/hooks/useDebtors.ts) — drop `getStoredUser`, use `useCurrentUser`; consider migrating to `createCrudHooks`.
- [x] R37. [hooks/useAssignments.ts](web/hooks/useAssignments.ts) — same.
- [x] R38. [hooks/useCallRecords.ts](web/hooks/useCallRecords.ts) — same.
- [x] R39. [hooks/usePayments.ts](web/hooks/usePayments.ts) — same.
- [x] R40. [hooks/useDiscountRequests.ts](web/hooks/useDiscountRequests.ts) — same.
- [x] R41. [hooks/usePortfolios.ts](web/hooks/usePortfolios.ts) — same.
- [x] R42. [components/debt-management/payments/PaymentsTable.tsx](web/components/debt-management/payments/PaymentsTable.tsx) — re-build on canonical `DataTable` + `RowActions`; remove inline skeleton/error.
- [x] R43. [components/debt-management/discount-requests/DiscountRequestsTable.tsx](web/components/debt-management/discount-requests/DiscountRequestsTable.tsx) — same.
- [x] R44. [components/debt-management/assignments/AssignmentsTable.tsx](web/components/debt-management/assignments/AssignmentsTable.tsx) — replace status-transition inline buttons with `<RowActions>` (dropdown-menu).
- [x] R45. [components/debt-management/payments/PaymentFormDialog.tsx](web/components/debt-management/payments/PaymentFormDialog.tsx) — rebuild on `FormDialog` + shadcn `Form` + `<Field>`; drop local `<FieldError>`.
- [x] R46. [components/debt-management/discount-requests/DecideDialog.tsx](web/components/debt-management/discount-requests/DecideDialog.tsx) — same.
- [x] R47. [components/debt-management/call-records/CallLogForm.tsx](web/components/debt-management/call-records/CallLogForm.tsx) — uses canonical `<Field>` wrapper and shared mutation/hook flow in the inline workspace panel.
- [x] R48. [components/debt-management/debtors/DebtorFormDialog.tsx](web/components/debt-management/debtors/DebtorFormDialog.tsx) — same.
- [x] R49. Run `pnpm tsc --noEmit` clean and `pnpm lint --max-warnings=0` clean across the full FE.

## 3.R.F Definition of Done (gate for resuming Phase 3 verticals)

- [x] R50. Zero files outside `lib/http/` call `fetch()` for API. Verified by: `rg "\bfetch\(" web/**/*.{ts,tsx}` only returns [web/lib/http/client.ts](web/lib/http/client.ts).
- [x] R51. Zero `function getStoredUser` outside `lib/auth/session.ts`. Verified by: `rg "function getStoredUser" web/` returns one hit at [web/lib/auth/session.ts](web/lib/auth/session.ts).
- [x] R52. Zero raw `<table>` or `@/components/ui/table` direct imports outside `components/data-table*`. Domain tables use canonical `DataTable`.
- [x] R53. Zero local `<FieldError>` components — all forms use `<Field>` from `components/forms/Field.tsx`.
- [x] R54. Bundle-size sanity: `pnpm build` succeeds; Next.js 16 analyze output under `.next/diagnostics/analyze` (equivalent to prior `.next/analyze`) and runtime dependency graph verifies no duplicated TanStack/RHF/Zod majors (`pnpm why @tanstack/react-query --prod`, `pnpm why react-hook-form --prod`, `pnpm why zod --prod`).
- [x] R55. Rule docs updated: [web/README.md](web/README.md), [docs/web/best-practice-frontend.md](docs/web/best-practice-frontend.md), [.github/skills/lawyer-management-system/SKILL.md](.github/skills/lawyer-management-system/SKILL.md), [.github/skills/fullstack/SKILL.md](.github/skills/fullstack/SKILL.md), [.github/skills/nextjs-app-router/SKILL.md](.github/skills/nextjs-app-router/SKILL.md), [.github/instructions/](.github/instructions/) (web rules file), and a CI guard workflow added under [.github/workflows/](.github/workflows/) at [.github/workflows/web-dry-guard.yml](.github/workflows/web-dry-guard.yml).

---

# Phase 3 — Implementation Plan (200 items)

> Order: **DB → BE models → BE services → BE handlers/routes → curl smoke → FE types → FE API client → FE hooks → FE pages → FE polish.** One feature vertical at a time.

## 3.0 Prerequisites (5)

- [ ] 1. Create branch `feat/debt-mgmt-vertical`.
- [ ] 2. Verify local DB up: `make db-up` then `make migrate-up` and `migrate -path migrations -database "$DATABASE_URL" version`.
- [ ] 3. Verify `make dev-api` and `make dev-web` work; capture baseline.
- [x] 4. Remove leftover landing routes from `web/app/[lang]/` (about, blog, contact, portfolio, services) OR move under a separate route group `(public)`. Decision: move under `(public)` and exclude from sidebar.
- [ ] 5. Update `docs/PROGRESS-TRACKER.md` after each sub-phase finishes.

## 3.1 Cross-cutting BE — Auth, audit, filters (15)

> Workflow stages: **Stage 2 DB migration (when needed)** -> **Stage 3 migration run + verify** -> **Stage 4 sqlc regeneration** -> **Stage 5 BE service/handler/router** -> **Stage 6 API contract sync (manual until Swag exists)** -> **Stage 7 FE contract sync (manual Zod + `apiFetch` + hooks until Orval exists)** -> **Stage 9 tests**.
>
> Codegen compliance: use only configured generators (`golang-migrate`, `sqlc`) for this slice; do not claim generated Swagger/OpenAPI or Orval artifacts.

- [x] 6. Add `internal/auth/jwt.go` (Verify + Issue using `HS256`, secret from env).
- [x] 7. Add `middleware/AuthJWT()` that populates `c.Set("userID", ...)`, `c.Set("role", ...)` from `Authorization: Bearer …`.
- [x] 8. Wire `AuthJWT()` to `/api/v1` group; replace `X-User-Role`/`X-User-ID` reads everywhere with context getters.
- [x] 9. Add `POST /api/v1/auth/login` (email+password → JWT pair) and `POST /api/v1/auth/refresh`.
- [x] 10. Add `GET /api/v1/auth/me`.
- [x] 11. Add migration `000016_audit_log.up.sql` (id, actor_id, action, entity_type, entity_id, before jsonb, after jsonb, created_at).
- [x] 12. Add `internal/auditlog/` writer + middleware hook on POST/PUT/PATCH/DELETE.
- [x] 13. Add reusable `model/Filter` struct (`Search, Status, Bucket, PortfolioID, AssignedTo, SupervisorID, DPDMin, DPDMax, DateFrom, DateTo, Sort, Order, Limit, Offset`).
- [x] 14. Add binding helper `internal/handler/query.go` to parse Filter from URL.
- [x] 15. Extend `debtors.sql` `ListDebtors` to accept all filters via `sqlc` named params; add `count` query.
- [x] 16. Extend `call_records.sql`, `payments.sql`, `assignments.sql`, `discount_requests.sql` with the same filter expansion.
- [x] 17. Add role scoping helper `service.ScopeForRole(role, userID)` returning extra WHERE predicates (Agent → assigned_to=userID; Supervisor → supervisor_id=userID OR team-of; Admin → none).
- [x] 18. Add `model/Pagination` envelope: `{items, total_count, limit, offset, has_more, next_offset}`.
- [x] 19. Add `model/Error` codes catalog (`ERR_VALIDATION`, `ERR_NOT_FOUND`, `ERR_CONFLICT`, `ERR_VERSION_CONFLICT`, `ERR_FORBIDDEN`, `ERR_UNAUTHORIZED`, `ERR_RATE_LIMIT`, `ERR_DEPENDENCY`, `ERR_INTERNAL`).
- [x] 20. Update `pkg/response/` to always emit `{error:{code,message,details?}}`.

## 3.2 Debtors vertical (BE 8 / FE 12 = 20)

> Workflow stages: **Stage 2 DB (if schema change)** -> **Stage 3 migrate + status verify** -> **Stage 4 sqlc output** -> **Stage 5 BE service/handler** -> **Stage 6 API contract sync (manual)** -> **Stage 7 FE schema/API/hooks (manual)** -> **Stage 8 FE page/components** -> **Stage 9 tests**.
>
> Codegen compliance: `sqlc` for DB access only; Stage 6-7 remain manual because Swag and Orval are not installed.

- [x] 21. Add `service.ListDebtors` honoring Filter + role scope; **return 200/empty array; 400 on bad filter; 403 on role; 401 on missing token**.
- [x] 22. Add `GET /debtors/:id` with role scoping + 404 / 403 paths.
- [x] 23. Update `POST /debtors` validation: required (contract_no unique, customer_name, portfolio_id, outstanding_balance≥0, dpd≥0).
- [x] 24. Update `PUT /debtors/:id` with OCC `version` check → `409 ERR_VERSION_CONFLICT` on mismatch.
- [x] 25. Update `DELETE /debtors/:id` → soft delete (`deleted_at=now`); 204 on success.
- [x] 26. Add `POST /debtors/bulk-assign` body `{debtor_ids:[], agent_id, priority?, supervisor_id?}` → creates Assignment per debtor + updates `debtors.assigned_to`.
- [x] 27. Add `GET /debtors/:id/history` returning unified timeline (call_records + payments + discount_requests + assignment changes), paged.
- [x] 28. sqlc regen + `make lint` clean.
- [x] 29. FE: define `Debtor` zod schema in `web/lib/schemas/debtor.ts`; export `Debtor`, `DebtorFilters`, `CreateDebtor`, `UpdateDebtor` via `z.infer`.
- [x] 30. FE: typed API methods `lib/api/debtors.ts` (list/get/create/update/delete/bulkAssign/history) using shared `apiFetch<T>()` with zod parse.
- [x] 31. FE: hooks `hooks/useDebtors.ts` (`useDebtorsList`, `useDebtor`, `useCreateDebtor`, `useUpdateDebtor`, `useDeleteDebtor`, `useBulkAssign`).
- [x] 32. FE: `app/[lang]/(app)/debtors/page.tsx` → Server Component; reads `searchParams` for filters; passes to Client `DebtorsTable`.
- [x] 33. FE: generic `components/data-table.tsx` — reusable table component with sorting, selection, pagination support.
- [x] 34. FE: generic `components/data-table-skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`, `selection-bar.tsx`, `pagination.tsx`.
- [x] 35. FE: refactored `components/debt-management/debtors-table.tsx` to use generic app-level components.
- [x] 35. FE: `components/debt-management/debtors/DebtorDetailDrawer.tsx` — uses Radix Dialog; sections: contract, financials, assignment, last activity, timeline.
- [x] 36. FE: `components/debt-management/debtors/DebtorFormDialog.tsx` — RHF + Zod; create + edit modes; OCC conflict toast.
- [x] 37. FE: skeletons (`DebtorsTableSkeleton`), empty state (`<EmptyState icon title body cta />`), error boundary (`error.tsx`).
- [x] 38. FE: `loading.tsx` for `/debtors` segment.
- [x] 39. FE: bulk-assign drawer launched from row selection.
- [x] 40. FE: replace hardcoded `PORTFOLIO_ID` with selector populated from `/portfolios` list (add `GET /portfolios` BE endpoint).

## 3.3 Assignments vertical (BE 5 / FE 8 = 13)

> Workflow stages: **Stage 2 DB (if schema change)** -> **Stage 3 migrate + status verify** -> **Stage 4 sqlc output** -> **Stage 5 BE service/handler** -> **Stage 6 API contract sync (manual)** -> **Stage 7 FE schema/API/hooks (manual)** -> **Stage 8 FE page/components** -> **Stage 9 tests**.
>
> Codegen compliance: no generated OpenAPI or Orval client output is claimed in this vertical.

- [x] 41. `service.ListAssignments` with filter (agent_id, supervisor_id, status, priority); role-scope.
- [x] 42. `POST /assignments` validation + duplicate guard `(debtor_id, status=Active)`.
- [x] 43. `PATCH /assignments/:id/status` with allowed transitions matrix (Active→Completed/Returned/Unassigned).
- [x] 44. `GET /assignments/workload` aggregate per agent (count, sum outstanding) — for supervisor screen.
- [x] 45. sqlc regen + tests.
- [x] 46. FE: zod schema + typed API client (`lib/schemas/assignment.ts`, `lib/api/assignments.ts`).
- [x] 47. FE: hooks (`useAssignments`, `useWorkload`, mutations) in `hooks/useAssignments.ts`.
- [x] 48. FE: `assignments/page.tsx` Server Component shell.
- [x] 49. FE: `AssignmentsTable` with status pill, agent avatar, priority chip.
- [x] 50. FE: `WorkloadKPIGrid` (Total active, Per-agent average, Top agent) — Supervisor only.
- [x] 51. FE: `AssignmentFilterBar` (agent multi-select, status, priority, date-range).
- [x] 52. FE: bulk-reassign dialog from selected rows.
- [x] 53. FE: empty/skeleton/error states.

## 3.4 Call records & PTP vertical (BE 7 / FE 10 = 17)

> Workflow stages: **Stage 2 DB (if constraint/schema change)** -> **Stage 3 migrate + status verify** -> **Stage 4 sqlc output** -> **Stage 5 BE service/handler** -> **Stage 6 API contract sync (manual)** -> **Stage 7 FE schema/API/hooks (manual)** -> **Stage 8 FE page/components** -> **Stage 9 tests**.
>
> Codegen compliance: sqlc-first backend path preserved; FE contract remains Zod + typed API modules.

- [x] 54. Validate `POST /call-records`: enums for phone_type/action/result; if `result=PTP` then ptp_date/ptp_amount required and ptp_date≥today; if `result=Paid` recommend follow-up payment creation.
- [x] 55. After create, if `result in (PTP, Paid, Legal)`, update `debtors.next_call_date`, `dpd`, `status` accordingly via transactional service.
- [x] 56. Add `GET /call-records?debtor_id=` paged.
- [x] 57. Add `GET /ptp/upcoming` (next 7 days) and `GET /ptp/overdue` for supervisor dashboard.
- [x] 58. Add unique-result-per-day guard? **Decision:** no; multiple attempts allowed.
- [x] 59. sqlc regen + service tests.
- [x] 60. Add audit-log entry on each call record (writer hook).
- [x] 61. FE: zod schemas (CallResult/PhoneType/CallAction).
- [x] 62. FE: typed API + hooks.
- [x] 63. FE: `app/[lang]/(app)/workspace/page.tsx` — **Agent Cockpit** Server shell + Client `AgentWorkspace`.
- [x] 64. FE: `AgentWorkspace` layout — left: assigned debtor list (virtualized if >100); center: active debtor header + tabs (Contract / Call log / Payments / Discount requests / Timeline); right: quick search / templates.
- [x] 65. FE: `CallLogForm` (RHF + Zod) with conditional PTP sub-form; success → toast + invalidate timeline.
- [x] 66. FE: `PaymentForm` inline; success → invalidate financial summary.
- [x] 67. FE: `Timeline` component (unified events from `/debtors/:id/history`).
- [x] 68. FE: PTP-upcoming widget on dashboard (Supervisor) + Agent header.
- [x] 69. FE: skeleton/empty/error per pane.
- [x] 70. FE: full keyboard flow: number-pad shortcuts for result (1=NTE, 2=PTP, 3=CB, …) and Enter to submit.

## 3.5 Payments vertical (BE 4 / FE 6 = 10)

> Workflow stages: **Stage 2 DB (if schema change)** -> **Stage 3 migrate + status verify** -> **Stage 4 sqlc output** -> **Stage 5 BE service/handler** -> **Stage 6 API contract sync (manual)** -> **Stage 7 FE schema/API/hooks (manual)** -> **Stage 8 FE page/components** -> **Stage 9 tests**.
>
> Codegen compliance: no Swag/Orval generation path is assumed; contracts stay manually synchronized.

- [x] 71. `POST /payments` enforce `UNIQUE(debtor_id, bill_no)`; on duplicate → 409 `ERR_CONFLICT` with body referencing existing record (idempotency).
- [x] 72. After insert, atomically update `debtors.paid_amount`, `outstanding_balance`; downgrade `status` to `Closed` when `outstanding_balance <= 0`.
- [x] 73. `GET /payments` filterable (debtor_id, date_from/to, agent_id).
- [x] 74. Add `GET /payments/summary` aggregate by day for charts.
- [x] 75. FE: zod + typed API + hooks.
- [x] 76. FE: `payments/page.tsx` Server shell.
- [x] 77. FE: `PaymentsTable` scrollable; sortable; row click → drawer.
- [x] 78. FE: `PaymentFormDialog` invoked from debtor detail or workspace.
- [x] 79. FE: `PaymentSummaryChart` (line) on dashboard.
- [x] 80. FE: state set.

## 3.6 Discount requests & approval vertical (BE 6 / FE 10 = 16)

> Workflow stages: **Stage 2 DB (if schema/index change)** -> **Stage 3 migrate + status verify** -> **Stage 4 sqlc output** -> **Stage 5 BE service/handler** -> **Stage 6 API contract sync (manual)** -> **Stage 7 FE schema/API/hooks (manual)** -> **Stage 8 FE page/components** -> **Stage 9 tests**.
>
> Codegen compliance: stage text now explicitly matches Codegen map constraints in `docs/project-workflow.md`.

- [x] 81. `POST /discount-requests` validate (debtor exists; agent role; requested_amount ≤ outstanding_balance; reason length 10–500). Status defaults `Pending`. Version=1.
- [x] 82. `PATCH /discount-requests/:id/decide` body `{action: 'approve'|'reject'|'return', approved_amount?, supervisor_remark?, version}` — OCC check; allowed only by Supervisor/Admin; sets `reviewed_by`, `reviewed_at`.
- [x] 83. On approve, write to `audit_log` and notify agent (notification table TBD; for now flag in response).
- [x] 84. `GET /discount-requests?status=Pending&supervisor_id=me` for queue.
- [x] 85. `GET /discount-requests/:id` with embedded debtor + agent info.
- [x] 86. Tests.
- [x] 87. FE: zod schemas (`ApprovalStatus`, `DiscountRequest`).
- [x] 88. FE: typed API + hooks (list, get, create, decide).
- [x] 89. FE: `app/[lang]/(app)/approve/page.tsx` — Supervisor approval workspace: pending queue left + detail panel right.
- [x] 90. FE: `DiscountRequestTimeline` showing state transitions.
- [x] 91. FE: `DecideDialog` with Approve / Reject / Return tabs; remark required for Reject/Return.
- [x] 92. FE: `DiscountRequestList` (Agent view, their own).
- [x] 93. FE: `RequestDiscountFormDialog` for agent workspace.
- [x] 94. FE: counter badge on sidebar for pending count (`useQueries` to fetch count cheaply).
- [x] 95. FE: empty/skeleton/error.
- [x] 96. FE: OCC conflict toast: "This request was updated by someone else. Refresh to continue."

## 3.1R-3.6R Codegen + Workflow Recheck (12)

> Goal: restart from 3.1 and re-validate verticals 3.1-3.6 against `docs/project-workflow.md` codegen map and stage order before continuing 3.7+.

- [x] RCK1. Confirm `docs/project-workflow.md` codegen map is the source of truth: `sqlc` and migrations are active; `swaggo/swag` and `orval` are not installed.
- [x] RCK2. Confirm repository has no generated Swagger/OpenAPI or Orval artifacts (`swagger.json`, `swagger.yaml`, `openapi.yaml`, `orval.config.*`).
- [x] RCK3. Reset phase status to "recheck in progress" for 3.1-3.6 and pause 3.7 until recheck is complete.
- [x] RCK4. Rechecked 3.1 (auth/audit/filters): stage flow remains compatible with active generators only (migrations + sqlc); no unavailable codegen claim.
- [x] RCK5. Rechecked 3.2 (debtors): FE contract wording remains manual (`z.infer` + typed API + hooks), no generated Swagger/Orval output claim.
- [x] RCK6. Rechecked 3.3 (assignments): Stage 6/7 wording does not imply generated OpenAPI spec or Orval client.
- [x] RCK7. Rechecked 3.4 (call records + PTP): sqlc-first backend flow preserved; no contradiction with current codegen map.
- [x] RCK8. Rechecked 3.5 (payments): FE contract flow remains manual and aligned with Stage 7 in `docs/project-workflow.md`.
- [x] RCK9. Rechecked 3.6 (discount requests): API contract notes align with manual contract sync pipeline.
- [x] RCK10. Remediation added/applied before reopening 3.7: reset 3.1-3.6 to recheck state, paused 3.7, and fixed stale wording from `request<T>()` to `apiFetch<T>()`.
- [x] RCK11. Added explicit Codegen readiness backlog for Swag and Orval adoption (below).
- [x] RCK12. Recheck gate closed: current tracker text has no contradiction with `docs/project-workflow.md` codegen availability.
- [x] RCK13. Normalized 3.1-3.6 section headers to the same stage-format style used by 3.7+.
- [x] RCK14. Added explicit "manual Stage 6/7" guard text under each of 3.1-3.6.

### Codegen Readiness Backlog (Swag + Orval)

- [ ] CGB1. Add Swag ownership and rollout decision note (owner, package scope, target release).
- [ ] CGB2. Install Swag in backend toolchain and add Makefile target for spec generation.
- [ ] CGB3. Add handler annotations for initial debt-management endpoints and generate first `swagger.json` / `swagger.yaml` artifact.
- [ ] CGB4. Add OpenAPI artifact publish location/versioning rule and CI validation.
- [ ] CGB5. Install Orval in `web/` only after CGB3 is complete and stable.
- [ ] CGB6. Add Orval config and generation target; define generated output paths and commit policy.
- [ ] CGB7. Run one pilot migration from manual FE API module to Orval-generated client, compare parity and rollback path.
- [ ] CGB8. Update `docs/project-workflow.md`, `.github/skills/generate-api-spec/SKILL.md`, and `.github/skills/generate-frontend-types/SKILL.md` in the same PR that enables generators.

## 3.7 Imports vertical (BE 12 / FE 10 = 22)

> Workflow stages: **Stage 2 DB** (optional migration 000018) → **Stage 3 run `make sqlc`** → **Stage 5 BE service+handler** → **Stage 7 FE schema+api+hooks** → **Stage 8 FE pages+components** → **Stage 9 tests**.
>
> Commands: `make migrate-create name=imports_attachments`, `make migrate-up`, `make sqlc`, `cd common-api && go test ./...`, `cd web && pnpm type-check`, `cd web && pnpm lint --max-warnings=0`.

- [ ] 97. (Stage 2) Migration `000018_attachments.up.sql` (id, kind, path, size, mime, created_by, created_at) — optional, only if storing uploaded source files.
- [x] 98. (Stage 5) `POST /imports` multipart endpoint accepting `file` field; size cap 10 MiB; MIME check (csv, xlsx).
- [ ] 99. (Stage 5) Persist file to `./var/uploads/{uuid}.{ext}`; create `import_session` row with `status=Processing`.
- [x] 100. (Stage 5) Add `internal/job/import/worker.go` — spawned goroutine; parses CSV/XLSX row-by-row; writes `import_log_entries`; upserts `debtors` (by `contract_no`); updates session counters.
- [x] 101. (Stage 5) Dry-run mode: `?dry_run=true` parses + validates only.
- [x] 102. (Stage 5) `GET /imports/:id` returns session with counts.
- [x] 103. (Stage 5) `GET /imports/:id/logs?status=Error` paged.
- [~] 104. (Stage 5) `POST /imports/:id/commit` endpoint is present; currently returns validation response because post-dry-run commit replay (from persisted source file) is not implemented yet.
- [x] 105. (Stage 5) `DELETE /imports/:id` cancels if `status=Processing` (set flag, worker exits cooperatively).
- [x] 106. (Stage 5) Excel parsing via `excelize`; CSV via `encoding/csv`.
- [ ] 107. (Stage 5) Per-row validation reuses `service.CreateDebtor` validators (DRY).
- [ ] 108. (Stage 9) Tests with sample CSV/XLSX fixtures: `cd common-api && go test ./internal/service`.
- [x] 109. (Stage 7) FE: zod schemas + typed API + hooks.
- [x] 110. (Stage 8) FE: `app/[lang]/(app)/imports/page.tsx` — sessions list with status pills.
- [x] 111. (Stage 8) FE: `imports/[id]/page.tsx` — session detail with progress bar (poll every 2s while Processing) + error table.
- [ ] 112. (Stage 8) FE: `ImportWizard` — Step 1 Upload → Step 2 Preview (dry-run summary) → Step 3 Commit → Step 4 Result.
- [x] 113. (Stage 8) FE: drag-drop zone with file-type + size validation.
- [x] 114. (Stage 8) FE: `ImportErrorTable` reusing pattern from `example-form-air-project/web/src/components/excel-error-table`.
- [x] 115. (Stage 8) FE: download error report CSV from error rows.
- [x] 116. (Stage 8) FE: skeleton/empty/error.
- [x] 117. (Stage 8) FE: cancel-import confirmation dialog.
- [x] 118. (Stage 8) FE: toast on completion (success/partial-fail/fail).

## 3.8 Exports vertical (BE 8 / FE 8 = 16)

> Workflow stages: **Stage 5 BE service+handler** → **Stage 7 FE schema+api+hooks** → **Stage 8 FE pages+components** → **Stage 9 tests**.
>
> Commands: `make sqlc` if queries added, `cd common-api && go test ./...`, `cd web && pnpm type-check`, `cd web && pnpm lint --max-warnings=0`.

- [ ] 119. (Stage 5) Add `internal/job/export/csv.go`, `xlsx.go` (PDF out of scope this phase — return 400 `ERR_VALIDATION` if `file_format=pdf`).
- [ ] 120. (Stage 5) `POST /exports` body `{type, file_format, filters}`; creates row with `status=Processing`, returns id; spawns worker.
- [ ] 121. (Stage 5) Worker queries data per `type` (DebtorReport, PTPReport, PaymentReport, CallReport, AssignmentReport, LeaderboardReport), writes file to `./var/exports/{id}.{ext}`, updates row.
- [ ] 122. (Stage 5) `GET /exports/:id/download` streams file with `Content-Disposition: attachment`; checks role+ownership.
- [ ] 123. (Stage 5) Retention: TTL 7 days; nightly cleanup hook.
- [ ] 124. (Stage 5) `GET /exports` paged list with type, format, status, size, requested_by, created_at.
- [ ] 125. (Stage 5) `PATCH /exports/:id/status` — internal only (already exists) but restrict to admin.
- [ ] 126. (Stage 9) Tests: `cd common-api && go test ./internal/service`.
- [ ] 127. (Stage 7) FE: zod schemas + typed API + hooks.
- [ ] 128. (Stage 8) FE: `exports/page.tsx` history table.
- [ ] 129. (Stage 8) FE: `ExportRequestDialog` (type select, format select, filters dynamic per type, submit).
- [ ] 130. (Stage 8) FE: poll session status until done; download button enabled when ready.
- [ ] 131. (Stage 8) FE: per-row download link.
- [ ] 132. (Stage 8) FE: empty/skeleton/error.
- [ ] 133. (Stage 8) FE: success toast with copy-link action.
- [ ] 134. (Stage 8) FE: type-aware filter renderer (DRY pattern: object map keyed by `type`).

## 3.9 Dashboard vertical (BE 6 / FE 10 = 16)

> Workflow stages: **Stage 3–4 sqlc queries** → **Stage 5 BE service+handler** → **Stage 7 FE schema+api+hooks** → **Stage 8 FE pages+components** → **Stage 9 tests**.
>
> Commands: `make sqlc`, `cd common-api && go test ./internal/service`, `cd web && pnpm type-check`, `cd web && pnpm lint --max-warnings=0`.

- [ ] 135. (Stage 5) `GET /dashboard?date_from&date_to&portfolio_id?` already exists; extend with `agent_id?` for agent view; role-scope automatic.
- [ ] 136. (Stage 5) Add `GET /dashboard/aging` (DPD bucket counts + sums) if not already split.
- [ ] 137. (Stage 5) Add `GET /dashboard/calls?date_from&date_to` daily counts for chart.
- [ ] 138. (Stage 5) Add `GET /dashboard/collections?date_from&date_to` daily sums.
- [ ] 139. (Stage 5) Cache 60s in-memory per (role, userID, params).
- [ ] 140. (Stage 9) Tests: `cd common-api && go test ./internal/service`.
- [ ] 141. FE: zod schemas.
- [ ] 142. FE: typed API + hooks.
- [ ] 143. FE: `dashboard/page.tsx` Server shell → Client widgets (parallel `useQueries`).
- [ ] 144. FE: `KPIGrid` (Active debtors, Outstanding, Today calls, PTP today, Collected today, Success rate).
- [ ] 145. FE: `AgingBarChart` (Recharts).
- [ ] 146. FE: `CollectionsLineChart`.
- [ ] 147. FE: `LeaderboardTable`.
- [ ] 148. FE: `DateRangePicker` shared component.
- [ ] 149. FE: role-aware visibility (Agent: only own; Supervisor/Admin: team/global).
- [ ] 150. FE: skeleton/empty/error per widget.

## 3.10 Users CRUD vertical (BE 4 / FE 6 = 10)

> Workflow stages: **Stage 5 BE service+handler** → **Stage 7 FE schema+api+hooks** → **Stage 8 FE pages+components** → **Stage 9 tests**.
>
> Commands: `cd common-api && go test ./...`, `cd web && pnpm type-check`, `cd web && pnpm lint --max-warnings=0`.

- [ ] 151. (Stage 5) Confirm `POST/PUT /users` hashes password (bcrypt) and never returns hash.
- [ ] 152. (Stage 5) `PATCH /users/:id/status` (Active / Suspended).
- [ ] 153. (Stage 5) `PATCH /users/:id/role` admin-only.
- [ ] 154. (Stage 5) Filter `GET /users?role=&status=&q=`.
- [ ] 155. (Stage 7) FE: zod schemas + API + hooks.
- [ ] 156. (Stage 8) FE: `users/page.tsx` admin-only (route guard via Next middleware).
- [ ] 157. (Stage 8) FE: `UsersTable` + `UserFormDialog` (RHF + Zod, password strength meter).
- [ ] 158. (Stage 8) FE: status / role inline actions with confirmation dialog.
- [ ] 159. (Stage 8) FE: empty/skeleton/error.
- [ ] 160. (Stage 8) FE: 403 page when non-admin lands here.

## 3.11 Portfolios CRUD vertical (BE 3 / FE 4 = 7)

> Workflow stages: **Stage 5 BE service+handler** → **Stage 7 FE schema+api+hooks** → **Stage 8 FE pages+components** → **Stage 9 tests**.

- [ ] 161. (Stage 5) Confirm `GET /portfolios` list, `POST/PUT/DELETE /portfolios/:id` admin-only.
- [ ] 162. (Stage 5) Unique `code` enforcement → 409.
- [ ] 163. (Stage 9) Tests: `cd common-api && go test ./internal/service`.
- [ ] 164. (Stage 7) FE: typed API + hooks.
- [ ] 165. (Stage 8) FE: `portfolios/page.tsx` admin-only.
- [ ] 166. (Stage 8) FE: `PortfolioFormDialog`.
- [ ] 167. (Stage 8) FE: use portfolio selector everywhere a `portfolio_id` is needed (replace hardcoded constant).

## 3.12 FE shared / system polish (15)

- [ ] 168. Replace `web/lib/debt-runtime.ts` with `web/lib/auth/session.ts` and `useCurrentUser()` reading JWT/session state.
- [ ] 169. Login page (`/login`) calling `/auth/login`; on success set token + redirect.
- [ ] 170. Next.js `middleware.ts` to gate `/(app)` routes when no token.
- [ ] 171. Global `QueryClientProvider` in `app/[lang]/(app)/layout.tsx` with sensible defaults (staleTime 30s, retry once).
- [ ] 172. Global `Toaster` (sonner) wired.
- [ ] 173. Build shared `EmptyState`, `ErrorState`, `Skeleton.Table`, `Skeleton.Card` components.
- [ ] 174. Build shared `Table` primitives wrapping shadcn `Table` with scroll container and sticky header.
- [ ] 175. Build shared `FilterBar` slot pattern.
- [ ] 176. Build shared `Drawer` (Radix Dialog with side variant).
- [ ] 177. Build shared `DateRangePicker` and `Pagination` (replace existing).
- [ ] 178. Build shared `RoleGate` component (`<RoleGate allow={["Admin","Supervisor"]}>...`).
- [ ] 179. Build `useDebouncedValue`, `usePaginationParams` (search-params synced).
- [ ] 180. Rebuild `AppShellNav` with active-state, badges (pending count, overdue PTP), grouping (Workspace / Operations / Admin).
- [ ] 181. Theme + tokens audit (Tailwind config, design-system docs).
- [ ] 182. Remove all `any` from `web/lib/debt-api.ts`.

## 3.13 Tests & lint (10)

> Workflow stage 9. Run these after all verticals are complete.

- [ ] 183. (Stage 9) BE unit tests for each service: `cd common-api && go test ./internal/service` — cover debtors, assignments, call_records, payments, discount_requests, imports, exports, dashboard, users, portfolios.
- [ ] 184. (Stage 9) BE full test suite: `cd common-api && go test ./...`.
- [ ] 185. (Stage 9) FE unit tests for forms (Vitest + RTL): DebtorFormDialog, CallLogForm, PaymentForm, DecideDialog, ImportWizard, ExportRequestDialog.
- [ ] 186. (Stage 9) FE typecheck: `cd web && pnpm type-check` clean.
- [ ] 187. (Stage 9) FE lint: `cd web && pnpm lint --max-warnings=0` clean.
- [ ] 188. (Stage 9) BE lint: `make lint` clean (`golangci-lint v2.11.3`).
- [ ] 189. (Stage 9) `make test` BE green.
- [ ] 190. Add fixtures: `common-api/testdata/import_sample.csv`, `common-api/testdata/import_sample.xlsx` (with intentional bad rows).
- [ ] 191. Document local dev recipe in `docs/lawyer-debt-management-guide.md` (new file).
- [ ] 192. (Stage 10) Run `make validate-skills` if any `.github/skills/` changes were made.

## 3.14 Cleanup & docs (8)

- [ ] 193. Remove demo landing routes (or move to `(public)`).
- [ ] 194. Remove `web/app/[lang]/(app)/{workspace,approve,export,import,users}/page.tsx` placeholder stubs (now rebuilt).
- [ ] 195. Delete `debt-runtime.ts` and any dead helpers.
- [ ] 196. Update `docs/common-api/database-er-diagram.md` if new tables added (audit_log, attachments).
- [ ] 197. Update `docs/common-api/project-structure-guide.md` to list new packages (auth, job/import, job/export, auditlog).
- [ ] 198. Update `docs/web/project-structure-guide.md` (hooks/, schemas/, lib/api/).
- [ ] 199. Create `docs/lawyer-debt-management-guide.md` covering feature catalog, role matrix, API map, error catalog.
- [ ] 200. Update `docs/PROGRESS-TRACKER.md` to mark Phase 3 complete with metrics (LOC added, tests, files touched).

---

# Phase 4 — curl Testing Plan (10 items)

> All requests assume `API=http://localhost:3002` and an admin JWT obtained via `/auth/login` as `TOKEN`.

- [ ] 1. **Auth happy path:** `curl -X POST $API/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@local","password":"…"}'` → 200 with `{access_token, refresh_token}`; then `curl $API/api/v1/auth/me -H "Authorization: Bearer $TOKEN"` → 200.
- [ ] 2. **Auth failure cases:** wrong password → 401 `ERR_UNAUTHORIZED`; missing token → 401; expired token → 401; non-admin hitting `/users` → 403.
- [ ] 3. **Debtors CRUD:** create, get, list (with filters `?status=Active&bucket=31-60&dpd_min=10`), update (with version), delete; assert 201/200/409 (OCC)/404/204; pagination meta present.
- [ ] 4. **Bulk assign:** `POST /debtors/bulk-assign` with 5 ids → 200; verify each debtor `assigned_to`, and one assignment per debtor exists; second call same debtor → 409 duplicate.
- [ ] 5. **Call record + PTP:** post a `result=PTP` without ptp_date → 400 with field error; post valid → 201; assert `debtors.next_call_date` updated.
- [ ] 6. **Payment idempotency:** post same `(debtor_id, bill_no)` twice → first 201, second 409 referencing existing id; verify `debtors.outstanding_balance` recomputed.
- [ ] 7. **Discount approval flow:** agent creates request → 201; supervisor PATCH `/decide` with stale version → 409; with current version Approve → 200; subsequent Approve again → 409 (state already final).
- [ ] 8. **Import flow:** upload CSV with 2 valid + 1 invalid rows in dry-run mode → 200 session + 3 log entries; commit → counters updated to (success_rows=2, error_rows=1); GET session shows Completed-Partial.
- [ ] 9. **Export flow:** `POST /exports` `{type:DebtorReport,file_format:csv}` → 202/200 with id; poll `GET /exports/:id` until status=Completed; `GET /exports/:id/download` returns 200 file with correct headers; non-owner non-admin → 403.
- [ ] 10. **Dashboard role scoping:** as Agent → `total_outstanding` reflects only their assignments; as Supervisor → team only; as Admin → global. Compare numbers with raw `psql` sums to assert correctness.

---

# Phase 5 — UX / QA Testing Plan (placeholder)

To be expanded after Phase 3 completes, using `chrome-devtools-mcp` per `.github/skills/ai-agent-testing/SKILL.md`:
- Per-role smoke (Admin, Supervisor, Agent): login → primary workspace → 1 mutation → verify list/detail updates → logout.
- Skeleton/empty/error visible on disconnected backend.
- Table scrolls inside container; sticky header stays.
- Forms keyboard-navigable; modals trap focus; ESC closes.
- Toast appears on every mutation success/failure.

---

# Risks & Open Decisions

| # | Item | Decision |
| - | ---- | -------- |
| R1 | Real auth model | JWT in Authorization header + HttpOnly refresh cookie; revoke list out of scope this phase |
| R2 | File storage location | Local disk under `./var/{uploads,exports}` initially; abstract behind interface for future S3 |
| R3 | PDF export | **Out of scope this phase** — return 400 `ERR_VALIDATION` if `file_format=pdf` |
| R4 | Background jobs | In-process goroutines this phase; queue (NATS/Redis) deferred |
| R5 | Notifications | Out of scope (badge counters via polling for now) |
| R6 | i18n | Keep current `[lang]` route group; default `en` and `th` strings supplied for new UI |
| R7 | Removing landing pages | Move under `(public)` route group; do not delete content yet |

---

## Continuation Log — 2026-05-17

### Current Focus (updated 2026-05-17)

Phases 1, 2, 3.R, and the 3.1-3.6 codegen/workflow recheck are complete.

Next active work: **Phase 3.7 Imports**
1. Stage 2 DB: decide if migration `000018_attachments` is needed; create with `make migrate-create name=imports_attachments` if yes, skip if storing only in the local filesystem path.
2. Stage 3-4 sqlc: add `ListImportLogEntries` filtered query to `common-api/db/queries/import_sessions.sql`; run `make sqlc`.
3. Stage 5 BE: multipart POST, file persistence to `./var/uploads/`, worker goroutine, dry-run mode, and log endpoints.
4. Stage 7 FE: complete FE items 110-118 (wizard, drag-drop, error table, toasts).
5. Stage 9 tests: curl smoke plus backend/frontend validation commands.

After 3.7: proceed to 3.8 Exports, 3.9 Dashboard, 3.10 Users, 3.11 Portfolios, 3.12 FE polish, 3.13 Tests, 3.14 Cleanup.

### Active Queue (Continuation Batch A)

- [x] A1. Build single HTTP core: `web/lib/http/client.ts`, `web/lib/http/error.ts`, `web/lib/http/query-string.ts`.
- [x] A2. Build auth session core: `web/lib/auth/session.ts` + `web/hooks/useCurrentUser.ts`.
- [x] A3. Build query foundations: `web/lib/query/keys.ts` + `web/lib/query/crud-hooks.ts`.
- [x] A4. Install missing shadcn primitives listed in 3.R.C and expose from `web/components/ui/index.ts`.
- [x] A5. Promote canonical data table and remove legacy table implementation.
- [x] A6. Add reusable form abstractions (`Field`, `FormDialog`) and remove local form error duplicates.
- [x] A7. Refactor domain API modules (`debtors`, `assignments`, `call-records`, `payments`, `discount-requests`) to one shared HTTP client.
- [x] A8. Refactor domain hooks to one current-user source and shared query helpers.
- [x] A9. Refactor domain tables/forms to canonical shared components.
- [x] A10. Validate with `pnpm tsc --noEmit` and `pnpm lint --max-warnings=0`.

### Gate To Resume Vertical Expansion

Resume 3.4+ only after all conditions below are true:

- [x] G1. No duplicate API request wrappers remain outside shared HTTP core.
- [x] G2. No duplicate `getStoredUser` helpers remain outside session module.
- [x] G3. No domain-level raw table re-implementations remain.
- [x] G4. No local `FieldError` components remain.
- [x] G5. Typecheck and lint are green.

### Continuation Batch A - Progress Notes

- Converted `web/lib/api/portfolios.ts` from local request wrapper to shared `apiFetch`.
- Removed direct auth-token `localStorage` access from `web/lib/debt-api.ts` by delegating to `web/lib/auth/session.ts`.
- Migrated hooks to `useCurrentUser()` in: `useDebtors`, `useAssignments`, `useCallRecords`, `usePayments`, `useDiscountRequests`, `usePortfolios`.
- Extended `useCurrentUser()` return shape with `role` for consistent identity access.
- `web/lib/api/*` now uses shared `web/lib/http/client.ts` for all requests (no separate fetch wrapper remains).
- Installed shadcn primitives: dropdown-menu, label, textarea, tabs, tooltip, popover, command, separator, radio-group, pagination, sonner (plus manual `form.tsx` scaffold to align with shared form patterns).
- Added `web/components/ui/index.ts` barrel and shared components: `RowActions`, `Field`, `FormDialog`, `MoneyBadge`, `StatusBadge`.
- Migrated active forms and table actions to shared wrappers (`PaymentFormDialog`, `DecideDialog`, `CallLogForm`, `PaymentsTable`, `DiscountRequestsTable`).
- Migrated legacy callers to canonical `DataTable` and removed `web/components/debt-management/data-table.tsx`.
- Installed missing Radix deps for form scaffolding: `@radix-ui/react-label`, `@radix-ui/react-slot`.
- Validation update: both `pnpm -s tsc --noEmit` and `pnpm -s lint --max-warnings=0` now pass after targeted type/lint cleanup in shared DataTable typing, legacy debt-management forms/tables, and RHF watcher usage.

### Notes

- Keep Phase 4 curl plan unchanged; execute once vertical implementation passes this gate.
- Keep Phase 5 UX/QA plan unchanged; expand test matrix after core refactor stabilizes.

### Active Queue (Continuation Batch B)

- [x] B1. Complete AssignmentFilterBar with agent multi-select and date-range filters.
- [x] B2. Complete bulk-reassign flow from selected assignment rows with safe payload mapping.
- [x] B3. Validate with `pnpm -s tsc --noEmit` and `pnpm -s lint --max-warnings=0`.

### Continuation Batch B - Progress Notes

- Upgraded `AssignmentFilterBar` to support agent multi-select, status/priority filters, and assigned date-range controls.
- Extended assignment filter schema/API query mapping for `assigned_from`/`assigned_to`.
- Fixed bulk reassign payload mapping to use selected assignment rows (`debtor_id` source is now correct).
- Added safe transition step in bulk reassign: active assignments are moved to `Unassigned` before creating replacement active assignments.
- Validation update: `pnpm -s tsc --noEmit` and `pnpm -s lint --max-warnings=0` both pass after this batch.

### Active Queue (Continuation Batch C)

- [x] C1. Implement initial `AgentWorkspace` cockpit in workspace route with assigned-debtor selection and active-debtor panel.
- [x] C2. Integrate call logging + payment action + recent call timeline in workspace context.
- [x] C3. Expand cockpit layout to full three-pane flow (left list, center work area, right quick tools/templates) and keyboard shortcuts.
- [x] C4. Expand center tabs with Contract, Payments, and Discount Requests workflow.
- [x] C5. Add inline payment form in workspace and role-aware PTP dashboard widget.
- [x] C6. Add keyboard-first call-result shortcuts and Enter submit flow in `CallLogForm`.
- [x] C7. Add dedicated `RequestDiscountFormDialog` and wire it into workspace discount tab.
- [x] C8. Add virtualized rendering path for large assigned-debtor lists (>100 rows).

### Active Queue (Continuation Batch D)

- [x] D1. Make call-record create transactional and apply debtor side-effects in the same transaction.
- [x] D2. Add `Legal` call-result support in backend/frontend enums and DB constraint migration.
- [x] D3. Validate backend/frontend after call-record updates (`go test ./...`, `pnpm lint`, `pnpm tsc`).
- [x] D4. Make payment create idempotent/conflict-aware and transactional with debtor balance updates.

### Active Queue (Continuation Batch E)

- [x] E1. Add `GET /payments/summary` backend endpoint with daily aggregate query and role scoping.
- [x] E2. Wire FE payment summary schema/api/hook and render line chart on dashboard.
- [x] E3. Upgrade `PaymentsTable` with sort controls and row-detail drawer interaction.
- [x] E4. Validate backend/frontend after summary + table improvements.

### Active Queue (Continuation Batch F)

- [x] F1. Harden discount request create validation for debtor existence, agent-role enforcement, and amount ceiling.
- [x] F2. Validate backend compile/tests after discount create rule changes.

### Continuation Batch C - Progress Notes

- Replaced placeholder workspace content with a concrete `AgentWorkspace` client feature component.
- Added assigned-debtor worklist (search + select), active debtor summary, and tabbed center panel.
- Wired existing shared forms/components into workspace flow: `CallLogForm`, `PaymentFormDialog`, and `PTPWidget`.
- Added recent call timeline for selected debtor using call-record hooks.
- Expanded cockpit into three panes and added keyboard shortcuts (`Alt+1/2/3`) for fast tab switching.
- Added right-side quick tools and reusable call-note templates for operator speed.
- Switched workspace timeline to unified debtor history (`/debtors/:id/history`) instead of call-only events.
- Added workspace center tabs for Contract details, Payments table flow, and Discount Request submission/history.
- Added shortcut mapping for six workspace tabs (`Alt+1..6`).
- Added inline payment capture in workspace Payments tab with mutation-driven invalidation.
- Added role-aware PTP overview on dashboard (Supervisor panel + Agent scope header badge).
- Added keyboard-first call logging shortcuts in workspace (`Numpad1..5`, `Alt+1..5`) with Enter-to-submit behavior.
- Added dedicated discount request dialog component for agents and integrated it into workspace flow.
- Added virtualization path for assigned-debtor worklist when dataset exceeds 100 rows.
- Validation update: `pnpm -s lint --max-warnings=0` and `pnpm -s tsc --noEmit` pass after workspace integration.

### Continuation Batch D - Progress Notes

- Refactored `CallRecordService.Create` to run in a DB transaction and commit call-record + debtor updates atomically.
- Added paid-call follow-up recommendation behavior (auto remark when `result=Paid` and no remark provided).
- Added `Legal` as a valid call result in backend model, frontend schema, and a new migration updating `call_records_result_check`.
- Reserved migration number `000017` for legal call-result constraint update; next new migration should start at `000018`.
- Verified call-record/PTP list endpoints and no unique-per-day guard (decision kept as no guard).
- Confirmed audit logging for call-record writes via mutating-route audit middleware.
- Refactored payment create flow to run in a DB transaction and made debtor balance application part of the same commit.
- Added duplicate-payment conflict payload with `existing_payment_id` (idempotency hint) via `GetPaymentByDebtorAndBillNo` lookup.
- Regenerated sqlc after query additions and revalidated backend service compile/tests.
- Validation update: `cd common-api && go test ./...` and `cd web && pnpm -s lint --max-warnings=0 && pnpm -s tsc --noEmit` pass.

### Continuation Batch E - Progress Notes

- Added SQL + service + handler + router support for `GET /payments/summary` (daily count/amount aggregates).
- Applied payment-summary role scoping to keep Agent-level visibility restricted to the current agent.
- Extended payment frontend schema and API/hook layer with summary types and fetch flow.
- Added `PaymentSummaryChart` using Recharts and integrated it into dashboard with existing date range context.
- Upgraded `PaymentsTable` with column sorting and row-click drawer details while preserving DRY shared table behavior.
- Validation update: `cd common-api && make sqlc && go test ./...` and `cd web && pnpm -s lint --max-warnings=0 && pnpm -s tsc --noEmit` pass.

### Continuation Batch F - Progress Notes

- Enforced discount request create path to require actor-agent consistency and role `Agent`.
- Added create-time debtor existence check and requested-amount ceiling against debtor outstanding balance.
- Kept reason length, pending default status, and version semantics aligned with existing model/migration constraints.
- Validation update: `cd common-api && go test ./...` pass after discount-service hardening.

_Last updated: 2026-05-17 — continuation batches A–F complete (3.1–3.6 verticals done). PROGRESS-TRACKER restructured to follow `docs/project-workflow.md` stage pattern. Next: Continuation Batch G (Phase 3.7 Imports BE)._

### Active Queue (Continuation Batch G — Phase 3.7 Imports BE)

> Follow `docs/project-workflow.md` stages 2→4→5→7→8→9. Commands: `make migrate-create name=<n>`, `make migrate-up`, `make sqlc`, `cd common-api && go test ./...`, `cd web && pnpm type-check`, `cd web && pnpm lint --max-warnings=0`.

- [ ] G1. (Stage 2) Decide and create migration 000018: if uploading files to disk only, skip the `attachments` table; otherwise `make migrate-create name=imports_attachments` and write minimal schema.
- [ ] G2. (Stage 4) Add `ListImportLogEntries` query (filter by `import_session_id`, optional `status`) to `common-api/db/queries/import_sessions.sql`; run `make sqlc`.
- [x] G3. (Stage 5) Add `internal/job/import/worker.go` with goroutine, CSV/XLSX parsing (`excelize` + `encoding/csv`), debtor upsert, per-row error entries, cooperative cancel via context.
- [~] G4. (Stage 5) Added `POST /imports`, `GET /imports/:id`, `GET /imports/:id/logs`, `POST /imports/:id/commit`, `DELETE /imports/:id`; commit replay behavior after dry-run is not implemented yet.
- [x] G5. (Stage 5) Add dry-run mode (`?dry_run=true`): parse + validate only, no DB writes.
- [ ] G6. (Stage 5) Per-row validation delegates to existing `service.CreateDebtor` validator to avoid duplication.
- [ ] G7. (Stage 9) BE tests with `common-api/testdata/import_sample.csv` and `import_sample.xlsx` fixtures.
- [x] G8. (Stage 7) FE: confirm 109 zod schemas + API + hooks are complete; `useImportSession` polling runs every 2s while `status=Processing`.
- [~] G9. (Stage 8) Implemented sessions list page, session detail page, drag-drop upload, ImportErrorTable, error CSV download, skeleton/empty/error, cancel dialog, and toasts; multi-step preview/commit wizard is pending.
- [x] G10. (Stage 9) Validate: `cd common-api && go test ./internal/service ./internal/job ./internal/handler ./internal/router` and `cd web && pnpm type-check && pnpm lint --max-warnings=0` pass.

### Continuation Batch G - Progress Notes

- Added cooperative import cancellation registry in backend job layer and wired lifecycle register/clear.
- Updated `DELETE /imports/:id` to cancel processing sessions safely and persist cancel status instead of hard-deleting in-flight work.
- Added route-shape parity for imports API: `POST /imports`, `GET /imports/:id/logs`, and `POST /imports/:id/commit` (current commit endpoint returns validation until replay storage is added).
- Added imports session detail route at `web/app/[lang]/(app)/imports/[id]/page.tsx` with live polling progress and error-panel view.
- Enhanced imports UI with detail navigation, processing-aware cancel confirmation action, and error CSV download from `ImportErrorTable`.
- Validation update: backend `go test` targets and frontend `pnpm type-check` + `pnpm lint --max-warnings=0` are clean.
