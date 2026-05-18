# Project workflow

## Why this document exists
This is the single source of truth for how features are built in this project — from requirement to production. All docs/* and .github agent skills align to this document. New developers and AI agents should read this first.

## Stack overview
This monorepo builds a Lawyer management system with a Next.js 16 / React 19 / TypeScript frontend in `web/`, a Go 1.26 / Gin / PostgreSQL backend in `common-api/`, sqlc-generated database access, and golang-migrate SQL migrations stored in root `migrations/`. The current codegen philosophy is conservative: sqlc is the only configured generator; API specs and frontend clients are still hand-maintained through Go DTOs, Zod schemas, `apiFetch<T>()`, and TanStack Query hooks until Swagger and Orval are explicitly installed and wired.

## Codegen map

| Tool | Status | Input | Output | Command |
|------|--------|-------|--------|---------|
| sqlc | [x] configured | `common-api/db/queries/*.sql`, `migrations/*.sql`, `common-api/sqlc.yaml` | `common-api/db/sqlc/*` Go query/types package | `make sqlc` |
| golang-migrate | [x] configured | versioned files in `migrations/` | applied PostgreSQL schema version | `make migrate-create name=<name>`, `make migrate-up`, `make migrate-status` |
| Next.js analyzer | [x] configured | `web/app/**`, `web/components/**`, `web/next.config.ts` | `.next/diagnostics/analyze` | `cd web && pnpm build:analyze` |
| orval | [ ] not yet installed | future `swagger.json` or `openapi.yaml` | future typed frontend client/hooks | Install: `cd web && pnpm add -D orval` |
| swaggo/swag | [ ] not yet installed | future Gin swag annotations | future `swagger.json` / `swagger.yaml` | Install: `cd common-api && go install github.com/swaggo/swag/cmd/swag@latest` |
| atlas | [ ] not yet installed | future desired schema + database schema | future schema diff migration | Install: `brew install ariga/tap/atlas` or `go install ariga.io/atlas/cmd/atlas@latest` |
| wire | [ ] not yet installed | future provider sets | future DI wiring | Install: `cd common-api && go install github.com/google/wire/cmd/wire@latest` |
| lo | [ ] not yet installed | Go collections/helpers usage | helper functions from `github.com/samber/lo` | Install: `cd common-api && go get github.com/samber/lo@latest` |
| nuqs | [ ] not yet installed | URL state definitions | typed URL search-param state | Install: `cd web && pnpm add nuqs` |
| next-safe-action | [ ] not yet installed | server action schemas | typed server actions | Install: `cd web && pnpm add next-safe-action` |
| asynq | [ ] not yet installed | background task payloads | Redis-backed task queue | Install: `cd common-api && go get github.com/hibiken/asynq@latest` |
| @tanstack/react-table | [ ] not yet installed | table column/state definitions | advanced table state helpers | Install: `cd web && pnpm add @tanstack/react-table` |
| zap | [ ] not yet installed | structured log calls | Zap logger | Install: `cd common-api && go get go.uber.org/zap@latest` |

## Stage-by-stage workflow

### 1. Requirement -> design artifact
Read the related docs, `.github/skills/README.md`, and `docs/PROGRESS-TRACKER.md` before editing. Select a primary skill and optional secondary skill. Produce or update the feature plan in `docs/PROGRESS-TRACKER.md` or a feature-specific doc when the scope is large.

Output artifacts: selected skill note, updated tracker checklist, and any feature decision notes.

Commands:
```bash
make status
```

Conventions:
- Treat `demo-web/` as feature inventory, not source to copy.
- Treat `example-form-air-project/` as UI pattern reference, not code to paste.
- Keep UX management-system focused: worklists, forms, tables, dashboards, approvals, imports, exports.

### 2. Database -> SQL schema and sqlc queries
For schema changes, create an up/down migration pair first. Then update or add sqlc query files in `common-api/db/queries/`. sqlc reads root migrations as schema through `common-api/sqlc.yaml`.

Output artifacts: `migrations/0000xx_<name>.up.sql`, `migrations/0000xx_<name>.down.sql`, `common-api/db/queries/<domain>.sql`, generated `common-api/db/sqlc/*`.

Commands:
```bash
make migrate-create name=<migration_name>
make sqlc
```

Conventions:
- Migrations are sequential `000001_name.up.sql` / `000001_name.down.sql` pairs.
- Tables use snake_case names and columns.
- UUID primary keys use `gen_random_uuid()`.
- Money uses `numeric(18,2)` and is serialized to the frontend as strings.
- Soft delete columns are named `deleted_at`.
- Optimistic concurrency uses `version` where users can update the same record.
- sqlc query names use PascalCase verbs in comments, for example `-- name: ListDiscountRequests :many`.

### 3. Migration -> versioned migration and local run
There is no schema-diff migration generator installed yet. Do not claim Atlas exists. Write migration SQL manually, run it locally, and verify the version.

Output artifacts: applied DB version and regenerated sqlc code when schema affects queries.

Commands:
```bash
make db-up
make migrate-up
make migrate-status
make sqlc
```

Rollback command:
```bash
make migrate-down
```

### 4. Backend repository layer -> sqlc output and service querier
Do not hand-write repository SQL strings. Add typed SQL to `common-api/db/queries/*.sql`, run sqlc, then wrap the generated `sqlc.Queries` behind a narrow service-side interface when unit tests need mocks.

Output artifacts: generated sqlc methods, service-owned `XQuerier` interface, focused service tests when behavior is non-trivial.

Commands:
```bash
make sqlc
cd common-api && go test ./internal/service
```

Conventions:
- Service interfaces are defined by the consumer, for example `DiscountRequestQuerier` in `internal/service`.
- Keep interfaces narrow: only methods the service actually calls.
- Generated files under `common-api/db/sqlc/` are not edited manually.

### 5. Backend service + handler -> Gin pattern
Add domain DTOs and errors in `common-api/internal/model/`, business logic in `common-api/internal/service/`, and thin Gin handlers in `common-api/internal/handler/`. Register routes in `common-api/internal/router/router.go` with role middleware.

Output artifacts: model DTOs, service methods, handler methods, route registration, unit tests.

Commands:
```bash
cd common-api && gofmt -w internal db pkg cmd
cd common-api && go test ./...
cd common-api && go build ./...
```

Conventions:
- Handler constructors are `New<Domain>Handler`.
- Service constructors are `New<Domain>Service`.
- Handlers bind with `ShouldBindJSON` or `ShouldBindQuery`, then call services with `c.Request.Context()`.
- Responses use `pkg/response` envelopes: success `{ "data": ... }`, failure `{ "error": { "code", "message", "details" } }`.
- Domain errors live in `internal/model/errors.go` and map to HTTP status at the handler boundary.
- Auth context comes from JWT middleware keys, not caller-controlled feature code.
- Logging uses zerolog; Zap is not installed.

### 6. API spec -> Swagger/OpenAPI
Swagger generation is not installed or configured yet. Until it is, keep API contracts synchronized through Go DTOs, Zod frontend schemas, and this workflow. If the project adopts Swag, add annotations to handlers, install Swag, add a generation command, and commit generated spec files.

Future output artifacts: `swagger.json` and `swagger.yaml`.

Future commands after installation:
```bash
cd common-api && go install github.com/swaggo/swag/cmd/swag@latest
cd common-api && swag init -g cmd/api/main.go -o docs/swagger
```

Conventions:
- Do not add Orval until a real OpenAPI artifact exists.
- If a Makefile target is added for Swagger, update this document and `.github/skills/generate-api-spec/SKILL.md` in the same change.

### 7. Frontend type + client generation
Orval is not installed. The current frontend contract pattern is manual but strict: write Zod schemas in `web/lib/schemas/<domain>.ts`, typed API functions in `web/lib/api/<domain>.ts`, and hooks in `web/hooks/use<Domain>.ts`.

Output artifacts: Zod schema/types, typed `apiFetch<T>()` functions, React Query hooks.

Current commands:
```bash
cd web && pnpm type-check
```

Future Orval commands after Swagger exists and Orval is installed:
```bash
cd web && pnpm add -D orval
cd web && pnpm orval
```

Conventions:
- All backend calls go through `web/lib/http/client.ts` -> `apiFetch<T>()`.
- API files do not define their own fetcher, `API_BASE`, auth headers, or error classes.
- API contract types are exported from Zod schemas with `z.infer`.
- Standard list/detail/create/update/delete hooks should use `createCrudHooks(...)` when the domain shape fits.

### 8. Frontend feature implementation
Implement pages as thin route shells under `web/app/[lang]/...`, feature wrappers under `web/components/debt-management/...`, shared UI in `web/components/`, and primitives in `web/components/ui/` through shadcn.

Output artifacts: page shell, feature component, table/form/dialog/filter components, hooks, schema/API additions, loading/empty/error/success states.

Commands:
```bash
cd web && pnpm dlx shadcn@latest add <component>
cd web && pnpm lint --max-warnings=0
cd web && pnpm type-check
cd web && pnpm build
```

Conventions:
- Use `DataTable`, `Pagination`, `RowActions`, `EmptyState`, `ErrorState`, and `DataTableSkeleton` instead of local table/state implementations.
- Use `FormDialog` and `Field` for form dialogs.
- Use `MoneyBadge` and `StatusBadge` for money and status display.
- Use Sonner toasts for mutation feedback.
- Keep tables scrollable inside the table container, not by making the whole page scroll for table content.
- Do not use landing-page UX for internal management workflows.

### 9. Testing
Test the smallest meaningful slice first, then widen. Backend service tests use small consumer-defined interfaces or mocks. Frontend changes must pass lint, type-check, and production build. Browser QA uses the AI testing skill after the dev servers are running.

Output artifacts: unit tests, curl evidence when API behavior changes, build/lint logs, browser QA notes when UI behavior changes.

Commands:
```bash
cd common-api && go test ./internal/service
cd common-api && go test ./...
cd web && pnpm lint --max-warnings=0
cd web && pnpm type-check
cd web && pnpm build
make test
```

For local manual QA:
```bash
make db-up
make migrate-up
make dev-api
make dev-web
```

Conventions:
- Do not skip tests because data is missing; create required data through the tested flow or let the test fail.
- Prefer table-driven Go tests for business rules.
- For UI QA, snapshot before interacting and check console/network errors after major actions.

### 10. PR + review
Before review, summarize the requirement, files touched, DB/API/FE contract changes, migrations, generated outputs, and verification commands. Run skill validation whenever `.github/skills/` changes.

Output artifacts: PR summary, risk notes, checklist, validation output.

Commands:
```bash
make validate-skills
make lint
make test
make build
```

Review checks:
- Migration up/down pair is reversible.
- sqlc was regenerated after query/schema changes.
- Handler/service/model boundaries are preserved.
- API error shapes use `pkg/response` and domain error codes.
- Frontend uses one fetcher, one auth module, shared query keys, canonical tables/forms, and Zod schemas.
- Missing generators are marked as not installed rather than assumed.

## New feature checklist

[ ] Select primary skill from `.github/skills/README.md` and read it.  
[ ] Read this workflow and related docs.  
[ ] Update `docs/PROGRESS-TRACKER.md` or feature doc with scope and acceptance criteria.  
[ ] Decide whether the feature needs DB changes.  
[ ] If DB changes are needed, run `make migrate-create name=<name>` and write up/down SQL.  
[ ] Add or update sqlc queries in `common-api/db/queries/`.  
[ ] Run `make sqlc`.  
[ ] Implement Go model, service, handler, and router changes.  
[ ] Add focused Go tests for business rules and role scope.  
[ ] Run backend build/tests.  
[ ] Add or update frontend Zod schema in `web/lib/schemas/`.  
[ ] Add or update typed API functions in `web/lib/api/`.  
[ ] Add or update hooks in `web/hooks/`.  
[ ] Build UI from shared components and shadcn primitives.  
[ ] Verify loading, empty, error, and success states.  
[ ] Run frontend lint, type-check, and build.  
[ ] Run curl smoke tests for changed API endpoints when possible.  
[ ] Run browser QA for changed user flows when possible.  
[ ] Update docs and skills if workflow, commands, or conventions changed.  
[ ] Run `make validate-skills` after any `.github/skills/` edit.

## Naming conventions

| Area | Convention |
|------|------------|
| Migrations | `0000xx_<snake_case_name>.up.sql` and matching `.down.sql` |
| SQL tables/columns | snake_case, plural table names, `deleted_at`, `created_at`, `updated_at`, `version` where needed |
| sqlc query names | PascalCase verb+noun in `-- name:` comments, for example `GetImportSession`, `ListDiscountRequests` |
| Go packages | short lowercase package names such as `handler`, `service`, `model`, `middleware` |
| Go constructors | `New<Domain>Service`, `New<Domain>Handler` |
| Go interfaces | consumer-owned, narrow, suffixed by role when useful, for example `<Domain>Querier` |
| Go DTO JSON | snake_case JSON tags matching API contracts |
| API routes | `/api/v1/<plural-resource>`, nested actions as verbs only when stateful, for example `PATCH /discount-requests/:id/decide` |
| Frontend API files | `web/lib/api/<plural-domain>.ts`, kebab-case for multiword domains |
| Frontend schemas | `web/lib/schemas/<domain>.ts`, Zod schema names in PascalCase |
| Frontend hooks | `web/hooks/use<Domain>.ts`, exported hook names start with `use` |
| Frontend components | shared files kebab-case or existing PascalCase where established; React exports PascalCase |
| Feature components | `web/components/debt-management/<feature>/...` for debt-management verticals |
| Query keys | `makeKeys('<plural-domain>')` |
| Status/money rendering | `StatusBadge` and `MoneyBadge`, not inline formatter/color maps |

## All gen commands in one place

```bash
# Database migration files
make migrate-create name=<migration_name>

# Apply and inspect migrations
make db-up
make migrate-up
make migrate-status
make migrate-down

# sqlc generation
make sqlc

# Frontend bundle analysis
cd web && pnpm build:analyze

# Skill metadata validation
make validate-skills

# Future only, after Swag is installed and configured
cd common-api && swag init -g cmd/api/main.go -o docs/swagger

# Future only, after Orval is installed and configured
cd web && pnpm orval
```
