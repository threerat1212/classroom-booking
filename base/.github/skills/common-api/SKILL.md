---
name: common-api
description: "Go backend skill for the Lawyer management system. Use for Gin, sqlc, PostgreSQL, migrations, handlers, services, API design, auth, validation, and backend cleanup. Start here for common-api implementation details, then use fullstack only when the change spans multiple projects."
argument-hint: "Describe the common-api backend task"
---

# Common API

For full workflow context, see `docs/project-workflow.md`.

Use this as the backend-root skill for `common-api/` work.

## When to use

- API endpoint changes
- Go model and service refactors
- sqlc query and migration work
- Authentication, validation, and middleware updates
- Backend cleanup that should preserve the clean day-one architecture

## Workflow

1. Read the current backend pattern before editing.
2. Keep handlers thin and push logic into services.
3. Keep sqlc, migrations, and models aligned.
4. Validate with focused backend checks before widening scope.

## Rules

- Optimize for internal operations and data integrity.
- Prefer explicit JSON response shapes and clear error mapping.
- Reuse existing architecture boundaries.
- Keep documentation and instructions aligned with the Go backend direction.