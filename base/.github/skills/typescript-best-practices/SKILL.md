## Management System Notice

This repository targets a Lawyer management system.

---
name: typescript-best-practices
description: TypeScript implementation skill for this project. Use after the primary repo-direction skill when the task specifically needs type definitions, type safety, API response handling, state modeling, or TypeScript error resolution.
argument-hint: "Describe the TypeScript typing issue or modeling task"
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# TypeScript Best Practices

For full workflow context, see `docs/project-workflow.md`.

Project enforces **TypeScript strict mode**. Run `pnpm run tsc` to verify.

## CRITICAL: Zero Type Assertions Policy

**Never** use `as Type`, `!`, or `any` unless absolutely unavoidable.

```typescript
// ❌ NEVER
const user = data as User;
const name = user.name!;
const value: any = getUnknownValue();

// ✅ ALWAYS
if (isUser(data)) console.log(data.name);
const name = user?.name ?? 'Unknown';
const count = value ?? 0;
```

## Type Guards

```typescript
// Basic type guard
const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>; // only valid use of 'as'
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (obj.role === 'admin' || obj.role === 'user')
  );
};

// Array type guard
const isUserArray = (value: unknown): value is User[] =>
  Array.isArray(value) && value.every(isUser);
```

## Discriminated Unions for State

```typescript
// ❌ BAD — multiple booleans allow impossible states
type BadState = { isLoading: boolean; isError: boolean; data: User[] | null; error: string | null };

// ✅ GOOD — discriminated union
type DataState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Exhaustive switch
const handleResponse = <T>(response: ApiResponse<T>) => {
  switch (response.status) {
    case 'success': return response.data;
    case 'error': throw new Error(response.message);
    case 'loading': return null;
    default:
      const _exhaustive: never = response;
      throw new Error(`Unhandled: ${_exhaustive}`);
  }
};
```

## API Validation with Zod

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

type User = z.infer<typeof UserSchema>;

const fetchUser = async (id: string): Promise<User> => {
  const data: unknown = await fetch(`/api/users/${id}`).then(r => r.json());
  const result = UserSchema.safeParse(data);
  if (!result.success) throw new Error('Invalid user data from API');
  return result.data;
};
```

## Constants Over Enums

```typescript
// ✅ Prefer const objects
const USER_ROLES = { ADMIN: 'admin', USER: 'user' } as const;
type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

## Utility Types Quick Reference

| Pattern | Use Case |
|---------|----------|
| `Partial<T>` | Make all properties optional |
| `Required<T>` | Make all properties required |
| `Pick<T, K>` | Select specific properties |
| `Omit<T, K>` | Remove specific properties |
| `Record<K, V>` | Key-value mapping |
| `NonNullable<T>` | Remove null/undefined |

## Common Pitfalls

- Accessing before null check → `user?.name ?? 'Unknown'`
- Array index access → Use `users.at(0)` (returns `T | undefined`)
- `Object.keys()` type → use `Object.entries()` or `as (keyof typeof obj)[]`
- Trusting API response types → always validate with Zod `safeParse`

## Checklist

- [ ] No `any` — search for `: any`
- [ ] No type assertions — search for `as ` (except `as const`)
- [ ] No non-null assertions — search for `!.` or `!;`
- [ ] Type guards for unknown/union types
- [ ] Optional chaining (`?.`) for possibly null objects
- [ ] Nullish coalescing (`??`) for default values
- [ ] Zod validation for API responses
- [ ] Discriminated unions for multi-variant state
- [ ] `pnpm run tsc` passes with no errors
