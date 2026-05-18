> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Frontend Best Practices: TypeScript + Next.js + React

**Version:** 2.0  
**Last Updated:** November 26, 2025  
**Stack:** TypeScript 5, Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query, React Hook Form, Zod

Project-specific workflow and commands live in `docs/project-workflow.md`; this guide is supporting frontend guidance.

## Overview

TypeScript/Next.js/React specific best practices. Follow SOLID, DRY, KISS, and clean code principles.

## Quick Navigation

1. [TypeScript Standards](#typescript-standards)
2. [Next.js Architecture](#nextjs-architecture)
3. [React Patterns](#react-patterns)
4. [State Management](#state-management)
5. [Styling](#styling)
6. [API Integration](#api-integration)
7. [Performance](#performance)
8. [Testing](#testing)
9. [Security](#security)

## TypeScript Standards

### Strict Configuration

- Enable all strict checks in `tsconfig.json`
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- Never use `any` - use `unknown` + type guards instead

### Type Definitions

- must read docs/typescript-type-handling-best-practices.md for detailed guidelines
- **Interfaces** for object shapes
- **Type aliases** for unions, primitives, mapped types
- **Generics** for reusable components/functions
- **Utility types**: `Pick`, `Omit`, `Partial`, `Required`, `Record`

### Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

### Constants Over Enums

```typescript
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

## Next.js Architecture

### Project Structure

```
src/
├── app/                   # App Router (Next.js 16)
│   ├── (auth)/           # Route groups
│   ├── (dashboard)/
│   ├── api/              # API routes
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/               # Reusable UI
│   ├── features/         # Feature-specific
│   └── layout/           # Layouts
├── lib/                  # Utilities, API client
├── hooks/                # Custom hooks
├── store/                # State management
├── types/                # TypeScript types
└── styles/               # Global styles
```

### Server vs Client Components

- **Default to Server Components**: Fetch data directly, reduce JS bundle
- **Use Client Components for**:
  - Event handlers (onClick, onChange)
  - State (useState, useReducer)
  - Effects (useEffect)
  - Browser APIs (window, localStorage)
  - Custom hooks

### Data Fetching

- **Server components**: Direct fetch in component
- **Parallel fetching**: `Promise.all([...])`
- **Revalidation**: `revalidate` option or `revalidatePath()`
- **Static generation**: `generateStaticParams()`

### Route Handlers

- Use Next.js API routes for backend communication
- Validate with Zod schemas
- Return proper status codes
- Handle errors consistently

## React Patterns

### Component Design

- **Single responsibility**: One purpose per component
- **Composition over props**: Use children, slots
- **Props interface**: Always type props explicitly
- **Default props**: Use default parameters

### Custom Hooks

- Extract reusable logic
- Prefix with `use`
- Return object or array (destructuring)
- Handle cleanup in useEffect

### Compound Components

- Context + multiple components working together
- Flexible, composable APIs
- Hide internal state management

### Performance Optimization

- **React.memo**: Memoize expensive components
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize callback functions
- **Dynamic imports**: Code splitting with `next/dynamic`

## State Management

### Local State (useState)

- Component-specific state
- Form inputs, toggles, UI state
- Keep close to where it's used

### Global State

- Prefer server state in TanStack Query and auth/session state in `web/lib/auth/session.ts` plus `useCurrentUser()`.
- Zustand is not installed in `web/`; add it only through an explicit tooling decision.

### Server State (TanStack Query)

- Data fetching + caching
- Automatic refetching
- Optimistic updates
- Error handling built-in

### Form State (React Hook Form)

- Performant form handling
- Built-in validation
- Minimal re-renders
- Integrates with Zod

## Styling

### TailwindCSS Best Practices

- **Utility-first**: Use Tailwind classes
- **Extract patterns**: Component classes for repeated patterns
- **clsx**: Conditional classes
- **Mobile-first**: Default mobile, use breakpoints for larger
- **Custom config**: Extend theme in `tailwind.config.js`

### Responsive Design

```typescript
// Mobile-first approach
<div className="px-4 md:px-8 lg:px-16">
  <h1 className="text-3xl md:text-4xl lg:text-6xl">Title</h1>
</div>
```

### Dark Mode

- Use Tailwind's `dark:` variant
- System preference or manual toggle
- Store preference in localStorage

## API Integration

### API Client Pattern

- Centralized API layer (`web/lib/http/client.ts` plus `web/lib/api/<domain>.ts`)
- Type-safe requests/responses
- Auth token handling
- Error handling
- Base URL configuration

### Fetching Strategies

- **Server Components**: Direct fetch
- **Client Components**: SWR or React Query
- **Mutations**: React Query mutations or Server Actions
- **Optimistic updates**: Update UI before server response

### Error Handling

- Try-catch blocks for async operations
- Display user-friendly messages
- Log errors for debugging
- Retry logic for transient failures

## Performance

### Image Optimization

- Use Next.js `Image` component
- Responsive images with srcset
- Lazy loading by default
- Modern formats (WebP, AVIF)

### Code Splitting

- Route-based: automatic with App Router
- Component-based: `next/dynamic`
- Lazy load heavy components
- Defer non-critical JS

### Bundle Analysis

- `@next/bundle-analyzer`
- Monitor bundle size
- Tree-shake unused code
- Externalize large dependencies

### Core Web Vitals

- **LCP** < 2.5s: Optimize images, SSR
- **FID** < 100ms: Minimize JS, defer scripts
- **CLS** < 0.1: Set image dimensions, reserve space

## Testing

### Test Types

- **Unit**: Components, hooks, utils (Jest + RTL)
- **Integration**: User flows (Testing Library)
- **E2E**: Critical paths (Playwright)

### Testing Library

- Render component
- Query by role, label, text
- Simulate user interactions
- Assert on DOM state

### Test Best Practices

- Test behavior, not implementation
- Use semantic queries
- Avoid testing internal state
- Mock external dependencies

## Security

### XSS Prevention

- Never use `dangerouslySetInnerHTML` without sanitization
- Use DOMPurify for user content
- React escapes by default

### CSRF Protection

- Use Next.js API routes
- CSRF tokens for mutations
- SameSite cookies

### Secrets Management

- `NEXT_PUBLIC_*` for client-side
- Plain env vars for server-side only
- Never commit secrets to Git

### Content Security Policy

- Set CSP headers
- Restrict script sources
- Report violations

## Quick Reference

### Essential Commands

```bash
# Development
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint
pnpm run lint:fix

# Build
pnpm run build
pnpm run start
```

### Pre-Commit Checklist

- [ ] TypeScript errors resolved
- [ ] All tests passing
- [ ] Components properly typed
- [ ] Accessibility attributes added
- [ ] Performance optimized
- [ ] Error boundaries in place
- [ ] Loading states handled

## Key Takeaways

1. **Type safety**: Strict TypeScript, no `any`
2. **Server first**: Default to Server Components
3. **Performance**: Image optimization, code splitting, memoization
4. **Accessibility**: Semantic HTML, ARIA attributes
5. **Testing**: Unit + integration + E2E
6. **Security**: Sanitize inputs, protect secrets, CSP headers
7. **DX**: Fast feedback loops, good tooling
8. **Design System**: Use project UI components, not raw HTML elements

## Design System Component Rules

Always use the project's design system components instead of raw HTML:

| Instead of                        | Use                                                    |
| --------------------------------- | ------------------------------------------------------ |
| `<button>`                        | `Button` from `@/components/ui/button`                 |
| `<table>`                         | `DataTable` from `@/components/data-table`             |
| `<input type="number">`           | `NumberInput` from `@/components/ui/number-input`      |
| Inline status colors              | `TableBadge` from `@/components/ui/table-badge`        |
| `fixed inset-0 bg-black` overlays | `Dialog` from `@/components/ui/dialog`                 |
| per-hook toast boilerplate        | factory toast handling in `createCrudHooks(...)`       |
| Hand-rolled spinners              | `LoadingSpinner` from `@/components/ui/LoadingSpinner` |

**Shared status configs** — centralize in `@/lib/`:

- `status-config.ts` — generic order/payment statuses
- `shipment-status.ts` — shipment order statuses
- `shipment-expense-status.ts` — shipment expense statuses

Browse all components: `/design-system` | Docs: `docs/design-system/component-catalog.md`

## Project Quality Gate (web)

Run these in `web/` before merge:

```bash
pnpm lint --max-warnings=0
pnpm type-check
pnpm build
pnpm build:analyze
pnpm why @tanstack/react-query --prod
pnpm why react-hook-form --prod
pnpm why zod --prod
```

Analyze output path on Next.js 16: `.next/diagnostics/analyze`.

---

**Related:** [Backend Best Practices](./best-practice-backend.md) | [Code Standards](../web/docs/code-standards.md)
