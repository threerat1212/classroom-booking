## Management System Notice

This repository targets a Lawyer management system.

> For full workflow context, see docs/project-workflow.md.

# Backend best practices

Use this file as the short backend entrypoint before editing `common-api/`.

## Required reading

- `docs/project-workflow.md` for the requirement-to-production workflow.
- `docs/common-api/project-structure-guide.md` for the current backend layout.
- `docs/common-api/golang-guide.md` for Go, Gin, sqlc, migration, testing, and operational practices.

## Current backend rules

- Keep the dependency flow `handler -> service -> sqlc`.
- Put business rules in services, not handlers.
- Use `pkg/response` for JSON envelopes.
- Use root `migrations/` for schema changes and `common-api/db/queries/` for sqlc SQL.
- Run `make sqlc` after query or schema changes.
- Use zerolog for logging; Zap is not installed.
- Swagger/Swag and Atlas are not installed; mark them as future tooling unless they are explicitly added.