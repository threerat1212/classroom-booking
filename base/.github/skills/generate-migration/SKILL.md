---
name: generate-migration
description: "Migration skill for root golang-migrate SQL files. Use when creating, applying, rolling back, or reviewing database migrations for PostgreSQL schema changes."
argument-hint: "Describe the schema change and migration name"
---

# Generate Migration

For full workflow context, see `docs/project-workflow.md`.

Use this skill for database schema changes in root `migrations/`.

## Workflow

1. Confirm whether a DB change is actually required.
2. Create a versioned migration pair with `make migrate-create name=<snake_case_name>`.
3. Write reversible `.up.sql` and `.down.sql` files.
4. Apply locally with `make migrate-up`.
5. Verify with `make migrate-status`.
6. Run `make sqlc` if schema changes affect generated queries or types.

## Commands

```bash
make migrate-create name=<migration_name>
make db-up
make migrate-up
make migrate-status
make sqlc
```

## Constraints

- Atlas is not installed; do not claim schema-diff migration generation exists.
- Keep money as `numeric(18,2)`.
- Prefer `deleted_at` for soft delete and `version` for optimistic concurrency where needed.
