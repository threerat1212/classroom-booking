---
name: generate-frontend-types
description: "Frontend type/client generation skill. Use when planning Orval, OpenAPI-generated types, or maintaining current Zod schema plus apiFetch plus React Query frontend contracts."
argument-hint: "Describe the frontend API contract or generated client task"
---

# Generate Frontend Types

For full workflow context, see `docs/project-workflow.md`.

Use this skill for frontend API contracts in `web/`.

## Current status

Orval is not installed. Frontend contracts are currently hand-maintained with Zod schemas, typed API functions, and TanStack Query hooks.

## Current workflow

1. Add or update `web/lib/schemas/<domain>.ts` with Zod schemas and `z.infer` types.
2. Add or update `web/lib/api/<domain>.ts` using `apiFetch<T>()`.
3. Add or update `web/hooks/use<Domain>.ts` using React Query and `makeKeys(domain)`.
4. Run frontend type-check and build.

## Commands

```bash
cd web && pnpm type-check
cd web && pnpm build
```

## Future Orval setup

```bash
cd web && pnpm add -D orval
cd web && pnpm orval
```

## Constraints

- Do not add Orval until Swagger/OpenAPI exists.
- Do not create another fetcher or API error class.
- Keep schemas as the source of frontend runtime validation until generated clients replace them.
