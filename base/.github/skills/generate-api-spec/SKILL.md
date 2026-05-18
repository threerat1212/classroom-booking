---
name: generate-api-spec
description: "Swagger/OpenAPI generation skill for Gin APIs. Use when adding or planning API spec generation, swag annotations, swagger.json, swagger.yaml, or API contract publishing."
argument-hint: "Describe the API spec or endpoint contract to document"
---

# Generate API Spec

For full workflow context, see `docs/project-workflow.md`.

Use this skill when the task is specifically about Swagger/OpenAPI artifacts.

## Current status

Swag is not installed or configured in this repository yet. There is no committed `swagger.json`, `swagger.yaml`, or `orval.config.ts`.

## If API spec generation is requested

1. State that Swag is not yet installed.
2. Install only with user approval or as part of an explicit tooling task.
3. Add Gin annotations to handlers and DTOs.
4. Generate the spec and commit the generated artifact.
5. Update `docs/project-workflow.md` and frontend generation guidance in the same change.

## Install and future command

```bash
cd common-api && go install github.com/swaggo/swag/cmd/swag@latest
cd common-api && swag init -g cmd/api/main.go -o docs/swagger
```

## Constraints

- Do not pretend Swagger exists before the tool and output files are present.
- Do not introduce Orval until a real OpenAPI artifact exists.
