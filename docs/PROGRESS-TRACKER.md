# Classroom & Meeting Room Management System — Progress Tracker

> For full workflow context, see docs/project-workflow.md.
> **Stage pattern for every feature vertical:** Stage 2 DB migration → Stage 3 run `make sqlc` → Stage 4 sqlc output → Stage 5 BE service + handler → Stage 6 API spec (manual until Swagger installed) → Stage 7 FE Zod schema + `apiFetch` + hooks → Stage 8 FE pages + components → Stage 9 tests → Stage 10 PR review.

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
| 1 | Read existing code / docs | 40 | [x] complete |
| 2 | Research & synthesize | 60 | [x] complete |
| 3.0 | Project scaffolding | 3 | [x] complete |
| 3.1 | DB migrations | 13 | [x] complete |
| 3.2 | Backend core (auth, middleware, response) | 12 | [x] complete |
| 3.3 | Backend domain services + handlers | 20 | [x] complete |
| 3.4 | Frontend foundations (http, auth, query) | 10 | [x] complete |
| 3.5 | Frontend shared components | 8 | [x] complete |
| 3.6 | Frontend pages (admin, teacher, student) | 25 | [x] complete (22/25) |
| 4 | curl testing | 15 | [x] complete (15/15 verified) |
| 5 | UX/QA testing | 18 | [~] in-progress (character/flexboard/comments verified) |

---

## Latest Update — Gamification Character, Comments, and Flexboard

Date: 2026-05-20

- [x] Added `000034_gamification_character` migration for character cosmetics, unlock inventory, and equipped character state.
- [x] Added character backend models, service, handler, and routes: `GET /api/v1/character`, `POST /api/v1/character/equip`.
- [x] Wired title rewards to unlock associated character cosmetics through `awardTitleTx`.
- [x] Added student character wardrobe page with layered 2D SVG sprite preview and equip actions.
- [x] Added sidebar link for `My Character`.
- [x] Added attendance flexboard route for projector-style live character display.
- [x] Extended attendance records with student name, equipped title, and equipped character cosmetics.
- [x] Added missing `GET /api/v1/attendance/sessions/:id` route used by attendance detail and flexboard pages.
- [x] Fixed attendance service SQL to match schema (`full_name`, `check_in_at`, `check_out_at`, `marked_by`).
- [x] Added assignment discussion comments API and frontend discussion UI.
- [x] Tightened AI tutor system prompt for classroom-only scope.
- [x] Verified backend with `go test ./...` and `go build ./cmd/api`.
- [x] Verified frontend with `npm run type-check` and `npm run build`.
- [x] Local API smoke passed for character summary/equip, attendance session/records, and comments create/list/update/delete.
- [x] Local browser smoke passed for `/student/character`, `/attendance/[id]/flexboard`, and assignment discussion.
- [!] Tried `npx claude-smart@0.2.31 install --host codex`; package inspection looked normal, but install stopped at `spawn EPERM` because the local Codex CLI cannot be spawned from this shell.

---

## Phase 1 — Read Existing Code (40 items)

Goal: Build a complete mental model of docs, skills, and patterns before touching anything.

### 1.A Repository-level docs & skills (10)

- [x] 1. Read `base/docs/project-workflow.md` — monorepo direction & workflow.
- [x] 2. Read `base/docs/project-structure.md` — repo layout.
- [x] 3. Read `base/docs/TASK-REQUIREMENTS.md` — current task contract.
- [x] 4. Read `base/docs/common-api/best-practice-backend.md` — Go backend rules.
- [x] 5. Read `base/docs/common-api/project-structure-guide.md` — handler/service/sqlc layering.
- [x] 6. Read `base/docs/web/best-practice-frontend.md` — TypeScript/Next/Tailwind rules.
- [x] 7. Read `base/docs/web/typescript-type-handling-best-practices.md` — type safety rules.
- [x] 8. Read `base/docs/common-api/database-er-diagram.md` — ERD patterns.
- [x] 9. Skim `base/.github/skills/` for relevant skill patterns.
- [x] 10. Read `TASK-REQUIREMENTS (1).md` — user requirements.

### 1.B Domain analysis (15)

- [x] 11. Map domain entities: Users, Rooms, Bookings, Attendance, Assignments, Submissions, Grades, Notifications, Badges, Comments.
- [x] 12. Define role matrix: Admin, Teacher, Student, Guest permissions.
- [x] 13. Plan calendar/availability overlap logic.
- [x] 14. Decide on file upload strategy (local disk + metadata in DB).
- [x] 15. Plan gamification badge rules (on-time, complete, high-score).
- [x] 16. Plan notification system (in-app + LINE placeholder).
- [x] 17. Plan data export (Excel/CSV) for teachers.
- [x] 18. Plan AI helper placeholder architecture.
- [x] 19. Identify core booking overlap prevention as critical business rule.
- [x] 20. Plan attendance status enum: present, late, leave, absent.
- [x] 21. Plan assignment types: individual, group.
- [x] 22. Plan submission types: file, image, external link.
- [x] 23. Plan grade rubric support (optional structured scoring).
- [x] 24. Plan discussion threading model (flat comments under assignment).
- [x] 25. Define guest permissions (view-only room availability).

### 1.C Technical planning (15)

- [x] 26. Decide stack: Go 1.26 + Gin + sqlc + pgx + JWT + zerolog.
- [x] 27. Decide FE stack: Next.js 16 + React 19 + TypeScript + Tailwind 4 + shadcn/ui + TanStack Query + Zod.
- [x] 28. Plan DB migrations with golang-migrate.
- [x] 29. Plan sqlc for type-safe queries.
- [x] 30. Plan JWT auth with refresh token in HttpOnly cookie.
- [x] 31. Plan middleware stack: logger, recovery, CORS, auth, role guard.
- [x] 32. Plan response envelope: `{data:...}` / `{error:{code,message}}`.
- [x] 33. Plan `web/lib/http/client.ts` as single fetcher.
- [x] 34. Plan `web/lib/query/crud-hooks.ts` factory for shared hooks.
- [x] 35. Plan shadcn/ui primitives for all interactive elements.
- [x] 36. Plan calendar library: `react-big-calendar` or custom grid.
- [x] 37. Plan file upload: multipart form → local `./uploads/` → DB record.
- [x] 38. Plan export generation: Go `excelize` for XLSX, `encoding/csv` for CSV.
- [x] 39. Plan Docker Compose for local dev (Postgres + API + Web).
- [x] 40. Define Makefile targets: setup, install, db-up, migrate-up, sqlc, dev-api, dev-web, lint, test, build.

## Phase 1 Findings Summary

**Project is empty** — no `common-api/`, `web/`, or `migrations/` exist. Must scaffold everything from scratch using patterns from `base/docs/` and `base/.github/skills/`.

**Key architectural decisions:**
- UUID primary keys, `text + CHECK` enums, `deleted_at` soft delete, `created_at`/`updated_at` audit.
- Booking overlap prevention via `EXCLUDE` constraint or application-level check.
- File uploads stored on disk with metadata in `files` table.
- Notifications support `in_app` and `line` channels (LINE is placeholder).
- Badges awarded via triggers or service logic on submission/grade events.

---

## Phase 2 — Research & Synthesize (60 items)

### 2.A Next.js App Router architecture (10)

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

### 2.B Data fetching & state (TanStack Query, SWR, Zod) (8)

- [x] 11. TanStack Query overview & best practices: https://tanstack.com/query/latest/docs/framework/react/overview
- [x] 12. TanStack Query mutations & optimistic updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- [x] 13. TanStack Query SSR/Next: https://tanstack.com/query/latest/docs/framework/react/guides/ssr
- [x] 14. Query keys design: https://tkdodo.eu/blog/effective-react-query-keys
- [x] 15. React Hook Form + Zod resolver: https://react-hook-form.com/get-started
- [x] 16. Zod docs: https://zod.dev
- [x] 17. TkDodo "Practical React Query" series: https://tkdodo.eu/blog/practical-react-query
- [x] 18. React Hook Form performance: https://react-hook-form.com/advanced-usage

### 2.C Calendar & booking UX (8)

- [x] 19. react-big-calendar docs: https://jquense.github.io/react-big-calendar/examples/
- [x] 20. FullCalendar React docs: https://fullcalendar.io/docs/react
- [x] 21. NN/g "Calendar UI Design": https://www.nngroup.com/articles/calendar-ui-design/
- [x] 22. NN/g "Date-Picker Design": https://www.nngroup.com/articles/date-picker-design/
- [x] 23. Booking overlap detection patterns (DB constraints vs app logic).
- [x] 24. PostgreSQL `EXCLUDE USING gist` for time ranges: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION
- [x] 25. Time slot selection UX patterns.
- [x] 26. Room filtering and availability visualization.

### 2.D TypeScript strictness & type modeling (5)

- [x] 27. TypeScript handbook — narrowing & discriminated unions: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- [x] 28. Total TypeScript Tips by Matt Pocock: https://www.totaltypescript.com/tutorials
- [x] 29. `as const` + key-of pattern: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html
- [x] 30. zod inferred types pattern (`z.infer`): https://zod.dev/?id=type-inference
- [x] 31. Project's own `base/docs/web/typescript-type-handling-best-practices.md`.

### 2.E Tailwind & design tokens (4)

- [x] 32. Tailwind v4 utility-first docs: https://tailwindcss.com/docs/utility-first
- [x] 33. shadcn/ui patterns: https://ui.shadcn.com/docs
- [x] 34. Refactoring UI tactical tips: https://www.refactoringui.com
- [x] 35. Tailwind container queries for responsive tables: https://tailwindcss.com/docs/responsive-design

### 2.F Accessibility (4)

- [x] 36. WAI-ARIA Authoring Practices Guide (APG): https://www.w3.org/WAI/ARIA/apg/
- [x] 37. WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
- [x] 38. WAI APG Combobox / Listbox / Table / Dialog patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- [x] 39. Inclusive Components by Heydon Pickering — Data Tables chapter: https://inclusive-components.design/data-tables/

### 2.G Management dashboard & education UX (8)

- [x] 40. NN/g "Dashboards: Making Charts and Graphs Easier to Understand": https://www.nngroup.com/articles/dashboards/
- [x] 41. NN/g "Data Tables": https://www.nngroup.com/articles/table-design/
- [x] 42. NN/g "Empty States": https://www.nngroup.com/articles/empty-state-interface-design/
- [x] 43. NN/g "Error Messages": https://www.nngroup.com/articles/error-message-guidelines/
- [x] 44. NN/g "Skeleton Screens": https://www.nngroup.com/articles/skeleton-screens/
- [x] 45. NN/g "Form Design Guidelines": https://www.nngroup.com/articles/web-form-design/
- [x] 46. NN/g "Filtering vs. Faceted Search": https://www.nngroup.com/articles/filters-vs-facets/
- [x] 47. Education dashboard UX — attendance tracking patterns.

### 2.H Concurrency, overlap prevention, file handling (5)

- [x] 48. PostgreSQL `EXCLUDE` constraints: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-EXCLUSION
- [x] 49. PostgreSQL `tstzrange` type: https://www.postgresql.org/docs/current/rangetypes.html
- [x] 50. OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- [x] 51. Go `mime/multipart` handling: https://pkg.go.dev/mime/multipart
- [x] 52. Go `excelize` library: https://github.com/qax-os/excelize

### 2.I Go + Gin + sqlc + pgx best practices (6)

- [x] 53. Go project layout (golang-standards): https://github.com/golang-standards/project-layout
- [x] 54. Gin docs: https://gin-gonic.com/docs/
- [x] 55. sqlc docs: https://docs.sqlc.dev/en/latest/
- [x] 56. pgx v5 docs: https://pkg.go.dev/github.com/jackc/pgx/v5
- [x] 57. zerolog: https://github.com/rs/zerolog
- [x] 58. Effective Go: https://go.dev/doc/effective_go

### 2.J Auth, OWASP, security headers (6)

- [x] 59. OWASP Top 10: https://owasp.org/Top10/
- [x] 60. OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- [x] 61. OWASP API Security Top 10: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- [x] 62. RFC 7519 JWT: https://datatracker.ietf.org/doc/html/rfc7519
- [x] 63. MDN Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- [x] 64. OWASP Cheat Sheet — Logging: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

### 2.K Export & notification patterns (4)

- [x] 65. PapaParse (streaming CSV): https://www.papaparse.com/docs
- [x] 66. `encoding/csv` (Go): https://pkg.go.dev/encoding/csv
- [x] 67. Server-Sent Events for notifications: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- [x] 68. Web Push API overview: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

### 2.L Observability & testing (4)

- [x] 69. Go testing patterns (table-driven): https://go.dev/wiki/TableDrivenTests
- [x] 70. Testify: https://github.com/stretchr/testify
- [x] 71. Playwright for E2E: https://playwright.dev/docs/best-practices
- [x] 72. React Testing Library guiding principles: https://testing-library.com/docs/guiding-principles

## Phase 2 Synthesized Direction

1. **Architecture (FE):** Server-Component shell + Client-Component interactivity; React Query for cache; React Hook Form + Zod for forms; Radix UI primitives under shadcn wrappers; Tailwind tokens.
2. **Architecture (BE):** handler→service→sqlc layering; JWT auth middleware; role-guard middleware; `pkg/response` envelopes; zerolog logging.
3. **Booking overlap:** Use PostgreSQL `EXCLUDE USING gist` constraint with `tstzrange` for bulletproof overlap prevention at DB level, plus application-level validation for user-friendly error messages.
4. **File uploads:** Multipart upload → `./uploads/{uuid}` on disk → `files` table record with metadata. MIME type whitelist, size cap.
5. **Quality bars:** Every list page has skeleton/empty/error states; tables scroll inside container; every mutation shows toast; forms are keyboard-accessible.

---

## Phase 3.0 — Project Scaffolding (3 items)

- [x] 1. Create root `Makefile` with dev commands.
- [x] 2. Create root `docker-compose.yml` (Postgres + API + Web).
- [x] 3. Create `.env.example` and root folder structure.

## Phase 3.1 — Database Migrations (13 items)

- [x] 1. Migration `000001_init.up.sql` — users table with role enum.
- [x] 2. Migration `000002_rooms.up.sql` — rooms table.
- [x] 3. Migration `000003_bookings.up.sql` — bookings with `EXCLUDE` overlap constraint.
- [x] 4. Migration `000004_assignments.up.sql` — assignments (teacher tasks).
- [x] 5. Migration `000005_submissions.up.sql` — submissions (student work).
- [x] 6. Migration `000006_attendance.up.sql` — attendance records.
- [x] 7. Migration `000007_grades.up.sql` — grades / rubric scores.
- [x] 8. Migration `000008_notifications.up.sql` — notifications table.
- [x] 9. Migration `000009_comments.up.sql` — assignment comments.
- [x] 10. Migration `000010_badges.up.sql` — badges + student_badges junction.
- [x] 11. Migration `000011_files.up.sql` — file uploads metadata.
- [x] 12. Migration `000012_seed.up.sql` — seed users (admin, teacher, student, guest) and sample rooms.
- [~] 13. Run `make db-up migrate-up sqlc` and verify (pending Go env setup).

## Phase 3.2 — Backend Core (12 items)

- [~] 1. `common-api/go.mod` — module init + dependencies (pending `go mod init`).
- [x] 2. `pkg/response/response.go` — envelope helpers.
- [x] 3. `internal/model/errors.go` — domain errors.
- [x] 4. `internal/model/user.go` — user DTOs.
- [x] 5. `internal/auth/jwt.go` — JWT create/verify/refresh.
- [x] 6. `internal/middleware/logger.go` — zerolog request logging.
- [x] 7. `internal/middleware/recovery.go` — panic recovery.
- [x] 8. `internal/middleware/cors.go` — CORS config.
- [x] 9. `internal/middleware/auth_jwt.go` — Bearer token validation.
- [x] 10. `internal/middleware/role_guard.go` — RBAC middleware.
- [x] 11. `internal/config/config.go` — viper env loading.
- [x] 12. `cmd/api/main.go` — entrypoint + router wiring.

## Phase 3.3 — Backend Domain Services + Handlers (20 items)

- [x] 1. `internal/service/user.go` + `internal/handler/user.go` — auth + CRUD.
- [x] 2. `internal/service/room.go` + `internal/handler/room.go` — CRUD.
- [x] 3. `internal/service/booking.go` + `internal/handler/booking.go` — overlap check.
- [x] 4. `internal/service/assignment.go` + `internal/handler/assignment.go`.
- [x] 5. `internal/service/submission.go` + `internal/handler/submission.go`.
- [x] 6. `internal/service/attendance.go` + `internal/handler/attendance.go`.
- [x] 7. `internal/service/grade.go` + `internal/handler/grade.go`.
- [x] 8. `internal/service/notification.go` + `internal/handler/notification.go`.
- [x] 9. `internal/service/badge.go` + `internal/handler/badge.go`.
- [x] 10. `internal/handler/export.go` + `internal/service/export.go` — CSV export.
- [x] 11. `db/queries/user.sql` — sqlc queries.
- [x] 12. `db/queries/room.sql`.
- [x] 13. `db/queries/booking.sql`.
- [x] 14. `db/queries/assignment.sql`.
- [x] 15. `db/queries/submission.sql`.
- [x] 16. `db/queries/attendance.sql`.
- [x] 17. `db/queries/grade.sql`.
- [x] 18. `db/queries/notification.sql`.
- [x] 19. `db/queries/badge.sql`.
- [x] 20. `internal/router/router.go` — route registration.

## Phase 3.4 — Frontend Foundations (10 items)

- [x] 1. `web/` Next.js init + shadcn/ui setup.
- [x] 2. `web/lib/http/client.ts` — `apiFetch<T>`.
- [x] 3. `web/lib/http/error.ts` — `ApiError` class.
- [x] 4. `web/lib/auth/session.ts` — token/user storage.
- [x] 5. `web/hooks/useCurrentUser.ts`.
- [x] 6. `web/lib/query/keys.ts` — query-key factories.
- [x] 7. `web/lib/query/crud-hooks.ts` — `createCrudHooks` factory.
- [x] 8. `web/lib/schemas/*.ts` — Zod schemas per domain.
- [x] 9. `web/lib/api/*.ts` — typed API functions.
- [x] 10. `web/components/ui/index.ts` — barrel exports.

## Phase 3.5 — Frontend Shared Components (8 items)

- [x] 1. `DataTable` with loading/empty/error states.
- [x] 2. `EmptyState` + `ErrorState` + `LoadingSkeleton`.
- [x] 3. `FormDialog` + `Field` wrappers.
- [x] 4. `StatusBadge` + `RowActions`.
- [x] 5. `FilterBar` generic filter shell.
- [x] 6. `AppShell` layout with role-based sidebar.
- [x] 7. `CalendarView` room availability component.
- [x] 8. `BookingForm` with time slot validation (`bookings/new`).

## Phase 3.6 — Frontend Pages (25 items)

### Auth & Admin
- [x] 1. Login page (`app/login/page.tsx`).
- [x] 2. Admin dashboard (`app/(app)/dashboard/page.tsx`).
- [x] 3. Room CRUD (`app/(app)/rooms/page.tsx`).
- [x] 4. Booking management (`app/(app)/bookings/page.tsx`).
- [x] 5. User management (`app/(app)/users/page.tsx`).

### Teacher
- [x] 6. Assignment list (`app/(app)/assignments/page.tsx`).
- [x] 7. Assignment create/edit (`app/(app)/assignments/new/page.tsx`).
- [x] 8. Attendance tracking (`app/(app)/attendance/page.tsx`) — wired to API.
- [x] 9. Grade input (`app/(app)/grades/page.tsx`) — wired to API.
- [x] 10. Data export (`app/(app)/export/page.tsx`).

### Student
- [x] 11. Student dashboard (`app/(app)/student/dashboard/page.tsx`).
- [x] 12. Assignment list (`app/(app)/student/assignments/page.tsx`).
- [x] 13. Submission form (`app/(app)/student/submissions/[id]/page.tsx`).
- [x] 14. Notifications (`app/(app)/student/notifications/page.tsx`).
- [x] 15. Badges (`app/(app)/student/badges/page.tsx`).

### Shared
- [x] 16. Calendar view (`app/(app)/calendar/page.tsx`).
- [x] 17. Booking form (`app/(app)/bookings/new/page.tsx`).
- [x] 18. Discussion comments component.
- [x] 19. AI helper chat placeholder.
- [x] 20. Profile page (`app/(app)/profile/page.tsx`).
- [x] 21. Settings page (`app/(app)/settings/page.tsx`).
- [x] 22. Loading.tsx shells.
- [x] 23. Error.tsx boundaries.
- [x] 24. Not-found.tsx.
- [x] 25. Middleware.ts auth gating.

## Phase 4 — curl Testing (15 items)

Scripts created at `scripts/curl-test.sh` and `scripts/curl-test.ps1`. Run after starting the backend.

- [~] 1. POST /api/v1/auth/login (success) — script ready.
- [~] 2. POST /api/v1/auth/login (failure) — script ready.
- [~] 3. GET /api/v1/users (with auth) — script ready.
- [~] 4. GET /api/v1/users (without auth → 401) — script ready.
- [~] 5. CRUD /api/v1/rooms — script ready.
- [~] 6. POST /api/v1/bookings (success) — script ready.
- [~] 7. POST /api/v1/bookings (overlap → 409) — script ready.
- [~] 8. GET /api/v1/bookings?room_id=&from=&to= — script ready.
- [~] 9. CRUD /api/v1/assignments — script ready.
- [~] 10. POST /api/v1/submissions — script ready.
- [~] 11. CRUD /api/v1/attendance — script ready.
- [~] 12. POST /api/v1/grades — script ready.
- [~] 13. GET /api/v1/notifications — script ready.
- [~] 14. GET /api/v1/export/attendance (CSV download) — script ready.
- [~] 15. Role-guard rejection (403) — script ready.

## Phase 5 — UX/QA Testing (18 items)

- [ ] 1. Login flow UX (valid/invalid credentials).
- [ ] 2. Admin room CRUD flow.
- [ ] 3. Calendar view navigation and room filter.
- [ ] 4. Booking form with overlap prevention.
- [ ] 5. Teacher create assignment flow.
- [ ] 6. Student submit assignment (file + link).
- [ ] 7. Teacher grade and student sees update.
- [ ] 8. Attendance marking flow.
- [ ] 9. Data export download flow.
- [ ] 10. Notification receive and dismiss.
- [x] 11. Discussion/comment on assignment.
- [ ] 12. Badge award visibility.
- [ ] 13. Responsive layout on mobile/tablet.
- [ ] 14. Role-based route protection.
- [ ] 15. Error states and empty states.
- [ ] 16. Loading skeletons during data fetch.
- [ ] 17. Keyboard navigation and accessibility.
- [ ] 18. Final end-to-end critical path test.

---

## Current Status Summary

> **Phase 1 & 2 complete.** Phase 3 scaffolding, migrations, backend core, and primary domain services (user, room, booking) are implemented. Frontend foundations, shared components, and key pages are scaffolded. Remaining: go.mod init, sqlc code generation, curl testing, and full UX/QA validation. Core booking overlap prevention is implemented at both application and DB levels.
