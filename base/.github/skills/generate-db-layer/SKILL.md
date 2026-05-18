---
name: generate-db-layer
description: "sqlc database-layer generation skill for this repository. Use when adding or changing SQL queries, regenerated db/sqlc code, repository access methods, or service querier interfaces in common-api."
argument-hint: "Describe the database query or sqlc layer to generate"
---

# Generate DB Layer

For full workflow context, see `docs/project-workflow.md`.

Use this skill when the task changes `common-api/db/queries/*.sql`, root `migrations/*.sql`, or generated sqlc access code.

## Workflow

1. Read the existing query file for the domain first.
2. Add or change annotated SQL in `common-api/db/queries/<domain>.sql`.
3. Keep query names PascalCase in `-- name: <QueryName> :one|:many|:exec` comments.
4. Run `make sqlc` from the repo root.
5. Do not edit `common-api/db/sqlc/*` by hand.
6. Wrap generated methods behind a narrow service-owned querier interface when tests need a mock.

## Commands

```bash
make sqlc
cd common-api && go test ./internal/service
```

## Constraints

- sqlc is configured in `common-api/sqlc.yaml`.
- Schema input comes from root `migrations/`.
- SQL must stay parameterized; no raw SQL string building in services.
