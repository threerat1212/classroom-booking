## Management System Notice

This repository targets a Lawyer management system.

# Web API client architecture

> For full workflow context, see docs/project-workflow.md.

## Overview

The web app talks to `common-api` through one fetcher, `web/lib/http/client.ts`, and typed domain API modules in `web/lib/api/`. Runtime contracts are maintained with Zod schemas in `web/lib/schemas/`, and Client Components consume server state through TanStack Query hooks in `web/hooks/`.

## Current flow

```text
Component -> hook in web/hooks/use<Domain>.ts
          -> API function in web/lib/api/<domain>.ts
          -> apiFetch<T>() in web/lib/http/client.ts
          -> common-api /api/v1 response envelope
```

## Single fetcher rule

- All HTTP calls to `common-api` go through `apiFetch<T>()`.
- No domain API file defines `API_BASE`, a second `request<T>()`, auth header logic, or custom error classes.
- `apiFetch<T>()` unwraps `{ data }` responses and turns `{ error: { code, message, details } }` into `ApiError`.
- Multipart uploads pass `isFormData: true` so the browser owns the multipart boundary.

## Contract files

| Concern | Location | Example |
|---------|----------|---------|
| Runtime schema and TS type | `web/lib/schemas/<domain>.ts` | `ImportSessionSchema`, `type ImportSession` |
| HTTP functions | `web/lib/api/<domain>.ts` | `listImportSessions`, `uploadImportFile` |
| Query/mutation hooks | `web/hooks/use<Domain>.ts` | `useImportSessionsList`, `useUploadImport` |
| Query keys | `web/lib/query/keys.ts` | `makeKeys('imports')` |
| CRUD hook factory | `web/lib/query/crud-hooks.ts` | `createCrudHooks(...)` |

## Error model

The backend returns:

```json
{ "error": { "code": "ERR_VALIDATION", "message": "invalid query parameters", "details": {} } }
```

The frontend receives an `ApiError` with `code`, `status`, `message`, and optional `details`.

## Generation status

Swagger/Swag and Orval are not installed yet. Until they are added, keep Go DTOs, Zod schemas, typed API functions, and hooks synchronized manually.
