> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Project Structure Guide

## Directory Layout

```
common-api/
├── cmd/api/main.go                  Entry point — wiring only
├── internal/
│   ├── config/config.go             Viper-based config loading from .env + env vars
│   ├── handler/
│   │   ├── health.go                GET /health
│   │   └── user.go                  CRUD handlers (Get, List, Create, Update, Delete)
│   ├── service/
│   │   └── user.go                  Business logic + sqlc-to-domain type conversion
│   ├── model/
│   │   ├── errors.go                Domain errors (ErrNotFound, ErrConflict, ErrValidation)
│   │   └── user.go                  Domain types + request/response DTOs
│   ├── middleware/
│   │   ├── auth_jwt.go              JWT Bearer token validation
│   │   ├── cors.go                  CORS with gin-contrib/cors
│   │   ├── logger.go                Request logging via zerolog
│   │   └── recovery.go             Panic recovery with stack trace logging
│   ├── job/                         Import/export in-process workers
│   └── router/router.go             Route registration + middleware wiring
├── db/
│   ├── queries/                     sqlc annotated SQL
│   │   ├── config.sql               Ping query
│   │   └── user.sql                 User CRUD queries
│   └── sqlc/                        Generated code (DO NOT EDIT)
├── pkg/response/response.go         Shared JSON response helpers
├── docker-compose.yml               PostgreSQL + API services
├── Dockerfile                       Multi-stage production build
├── Makefile                         Dev commands (run, build, test, lint, migrate, sqlc)
├── sqlc.yaml                        sqlc code generation config
└── README.md                        Project overview + quickstart
```

Root-level migrations live in `migrations/`, not inside `common-api/db/`.

## Layer Dependency Flow

```
main.go → router → handler → service → db/sqlc (generated)
              ↓         ↓         ↓
          middleware   model    config
```

## Key Design Decisions

### Handler Layer
- Receives HTTP requests, validates input with Gin's `ShouldBindJSON`/`ShouldBindQuery`
- Calls service methods with `c.Request.Context()`
- Maps domain errors to HTTP status codes via `handleError()`
- Uses `pkg/response` for consistent JSON structure

### Service Layer
- Defines its own interface (`UserQuerier`) for DB access — consumer-defined interfaces
- Contains business rules (email uniqueness check, defaults)
- Converts between sqlc types (`pgtype.UUID`) and domain types (`uuid.UUID`)
- Returns domain errors from `model` package

### Database Layer
- sqlc generates all DB access code from SQL queries
- Migrations managed by golang-migrate
- `pgxpool` for connection pooling (25 max, 5 min connections)
- No manual SQL string operations

### Configuration
- Viper loads from `.env` file + environment variables
- Environment variables override file values
- Required values validated at startup (fail fast)

### Middleware Stack
- Logger → Recovery → CORS (applied globally)
- Auth middleware available for protected route groups
