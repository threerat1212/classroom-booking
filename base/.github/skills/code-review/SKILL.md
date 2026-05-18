---
name: code-review
description: "Code review checklist skill for this repository. Use for PR review, regression checks, risk assessment, missing tests, DB/API/FE contract consistency, and docs/skill workflow compliance."
argument-hint: "Describe the change or PR to review"
---

# Code Review

For full workflow context, see `docs/project-workflow.md`.

Use this skill for reviewing changes before merge. Prefer findings over summaries.

## Review checklist

- Requirement is reflected in docs or tracker when scope is non-trivial.
- DB migrations have matching up/down files and are reversible.
- sqlc was regenerated after query or schema changes.
- Services own business rules and use narrow querier interfaces where tests need mocks.
- Handlers are thin and return the shared response envelope.
- Auth and role scope come from middleware context, not caller-controlled UI assumptions.
- Frontend API calls use `apiFetch<T>()` only.
- Frontend schemas live in `web/lib/schemas/` and use Zod-inferred types.
- Hooks use React Query, shared query keys, and CRUD factory where appropriate.
- Tables/forms/states reuse canonical components.
- Missing tools like Swag, Orval, Atlas, Asynq, and Zap are not referenced as installed.
- Tests or validation commands cover the changed layer.

## Commands

```bash
make validate-skills
make lint
make test
make build
```
