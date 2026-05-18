## Management System Notice

This repository targets a Lawyer management system.

---
name: nextjs-app-router
description: Next.js App Router implementation skill for this project. Use after the primary repo-direction skill when the task specifically involves pages, layouts, route handlers, params, searchParams, metadata, Server Components, or Client Components.
argument-hint: "Describe the App Router change, route, or rendering behavior needed"
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# Next.js App Router

For full workflow context, see `docs/project-workflow.md`.

Project: Next.js 16, React 19, TypeScript strict, pnpm.

## Server Components by Default

ALL components are Server Components unless you add `'use client'`.

**Needs `'use client'`:** `useState`, `useEffect`, hooks, `onClick`/`onChange` handlers, browser APIs (`localStorage`, `window`).

**Does NOT need `'use client'`:** Purely rendering data, async/await data fetching, passing handlers to child Client Components.

## CRITICAL: Async Params (Next.js 15+ / 16)

`params` and `searchParams` are Promises — must be awaited:

```typescript
// ❌ WRONG
export default function Page({ params }) {
  const id = params.id;
}

// ✅ CORRECT
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// ✅ searchParams too
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
}
```

## File Structure

```
app/
├── layout.tsx          # Root layout (required, has <html>/<body>)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI (Suspense boundary)
├── error.tsx           # Error boundary ('use client' required)
├── not-found.tsx       # 404 page
├── [slug]/
│   └── page.tsx        # Dynamic route /slug
├── [...slug]/
│   └── page.tsx        # Catch-all /a/b/c
├── (group)/            # Route group — no URL impact
│   └── page.tsx
└── api/
    └── users/
        └── route.ts    # API route: GET/POST /api/users
```

## Dynamic Routes

```typescript
// app/users/[id]/page.tsx
type Props = { params: Promise<{ id: string }> };

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();
  return <UserProfile user={user} />;
}
```

## Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  return NextResponse.json(await getUsers(page));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(await createUser(body), { status: 201 });
}
```

## Metadata

```typescript
// Static
export const metadata = { title: 'Page Title', description: '...' };

// Dynamic
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item.name };
}

// Root layout — use template for consistent titles
export const metadata = { title: { template: '%s | App Name', default: 'App Name' } };
```

## Common Pitfalls

1. **Using `useEffect` for data fetching** → Use Server Component with async/await instead
2. **Not awaiting `params`/`searchParams`** → Required in Next.js 15+ and still applies in Next.js 16
3. **Missing `notFound()` call** → Always handle missing data
4. **Unnecessary `'use client'`** → Default to Server Components
5. **Calling `fetch()` directly for API calls** → Use `apiFetch<T>()` from `web/lib/http/client.ts` (single fetcher rule, see web/README.md Rule 1)
6. **Re-implementing primitives** → Install via `pnpm dlx shadcn@latest add <component>` first, then customize (Rule 3)
7. **Local `<FieldError>` / inline skeleton / inline error states** → Use `<Field>`, `DataTable` (with built-in states), `ErrorState`, `EmptyState` (Rule 4)
8. **Per-domain `getStoredUser`** → Use `useCurrentUser()` from `web/hooks/useCurrentUser.ts` (Rule 2)
9. **Using both `middleware.ts` and `proxy.ts` in Next.js 16** → Keep only `proxy.ts`; having both fails build

## DRY Foundations (must use, must not duplicate)

| Concern | Single source of truth |
| ------- | ---------------------- |
| HTTP fetch | `web/lib/http/client.ts` → `apiFetch<T>()` |
| HTTP errors | `web/lib/http/error.ts` → `ApiError` |
| Auth session | `web/lib/auth/session.ts` |
| Current user (React) | `web/hooks/useCurrentUser.ts` |
| Query keys | `web/lib/query/keys.ts` → `makeKeys(domain)` |
| CRUD hooks | `web/lib/query/crud-hooks.ts` → `createCrudHooks(...)` |
| Tables | `web/components/data-table.tsx` |
| Row actions | `web/components/data-table/RowActions.tsx` |
| Forms | `web/components/forms/Field.tsx` + `FormDialog.tsx` |
| Money | `web/components/feedback/MoneyBadge.tsx` |
| Status | `web/components/feedback/StatusBadge.tsx` |
| UI primitives | `pnpm dlx shadcn@latest add <name>` → re-export in `web/components/ui/index.ts` |

If a foundation is missing, BUILD IT FIRST (see PROGRESS-TRACKER 3.R). Never fork it.

## Checklist

- [ ] Components are Server Components by default
- [ ] `params`/`searchParams` are awaited (Next.js 15+ / 16)
- [ ] `notFound()` used for missing data
- [ ] Metadata configured (title + description)
- [ ] Build passes: `pnpm run build`
- [ ] Analyze build passes: `pnpm run build:analyze`
- [ ] Next.js 16 analysis output reviewed at `.next/diagnostics/analyze`
