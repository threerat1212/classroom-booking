---
name: implement-handler
description: "Gin handler implementation skill for common-api. Use when adding or changing handlers, request binding, response envelopes, route registration, role guards, and service interfaces."
argument-hint: "Describe the handler endpoint or API behavior to implement"
---

# Implement Handler

For full workflow context, see `docs/project-workflow.md`.

Use this skill for Gin handlers in `common-api/internal/handler/`.

## Workflow

1. Read the existing handler/service/model pattern for the domain.
2. Define or update request/response DTOs in `internal/model`.
3. Keep the handler thin: bind, get actor/context, call service, map errors, return response.
4. Register routes in `internal/router/router.go` with the narrowest role middleware.
5. Put business rules in `internal/service`, not in handlers.
6. Add focused service tests when behavior or role scope changes.

## Conventions

- Constructors: `New<Domain>Handler`.
- Handler methods: `Get`, `List`, `Create`, `Update`, `Delete`, or explicit action names like `Decide`.
- Bind JSON with `ShouldBindJSON`; bind query params with `ShouldBindQuery`.
- Return success with `pkg/response.OK`, `Created`, or `NoContent`.
- Return errors through existing `handleError` or `pkg/response` helpers.

## Commands

```bash
cd common-api && gofmt -w internal
cd common-api && go test ./...
cd common-api && go build ./...
```
