> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# TypeScript Type Handling Best Practices (2020-2025)

**Version:** 1.0  
**Last Updated:** December 3, 2025  
**Project:** lawyer  
**Stack:** TypeScript 5, Next.js 16.2, React 19.2

---

## Table of Contents

1. [Type Safety Principles](#1-type-safety-principles)
2. [Avoid Type Assertions](#2-avoid-type-assertions)
3. [Type Narrowing Techniques](#3-type-narrowing-techniques)
4. [Strict Mode Configuration](#4-strict-mode-configuration)
5. [Type Definition Patterns](#5-type-definition-patterns)
6. [Union Types & Discriminated Unions](#6-union-types--discriminated-unions)
7. [Generic Types](#7-generic-types)
8. [Utility Types](#8-utility-types)
9. [ESLint Rules for Type Safety](#9-eslint-rules-for-type-safety)
10. [Common Anti-Patterns](#10-common-anti-patterns)

---

## 1. Type Safety Principles

### Core Philosophy

> **Zero `as` assertions** - If backend and frontend types match correctly, type assertions should never be needed.

### Golden Rules

1. **Type at the Source**: Define types where data originates (API responses, database models)
2. **Match Backend Types**: Frontend types should mirror Go DTOs and Zod schemas exactly
3. **Use Type Inference**: Let TypeScript infer types whenever possible
4. **Narrow, Don't Assert**: Use type guards to narrow types safely
5. **Explicit Over Implicit**: Better to be verbose than unsafe

---

## 2. Avoid Type Assertions

### ❌ BAD: Using `as` Assertions

```typescript
// DON'T DO THIS
const product = item.product as Product;
const id = data.id as number;
const response = (await fetch(url)) as Promise<User>;
```

### ✅ GOOD: Proper Type Definitions

```typescript
// DO THIS INSTEAD
// 1. Define proper types matching backend
type InventoryItem = {
  id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    keyword?: string | null; // Include ALL fields backend returns
  } | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  is_active: boolean;
};

// 2. Use type-safe conversion functions
const convertToTableRow = (item: InventoryItem): InventoryTableRow => {
  return {
    id: item.id,
    product_id: item.product_id,
    product_keyword: item.product?.keyword || null, // Properly typed
    product_name: item.product?.keyword || item.product?.name || 'Unknown',
    quantity_on_hand: item.quantity_on_hand,
    // ...rest of fields
  };
};

// 3. Use TypeScript generics for type safety
const response = await axiosClient.patch<InventoryItem>(`${API_INVENTORY.INVENTORY_ITEMS}${row.id}/`, {
  quantity_on_hand: row.quantity_on_hand,
});
const updatedItem = response.data; // Correctly typed as InventoryItem
```

### When `as const` is Acceptable

```typescript
// ✅ GOOD: as const for literal types
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const config = {
  align: 'center' as const, // For strict literal types
  color: 'blue' as const,
} as const;

// ✅ GOOD: as const for readonly arrays
const TABS = ['overview', 'settings', 'logs'] as const;
type TabType = (typeof TABS)[number]; // 'overview' | 'settings' | 'logs'
```

---

## 3. Type Narrowing Techniques

### Type Guards

```typescript
// ✅ GOOD: User-defined type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'email' in obj;
}

// Usage
if (isUser(data)) {
  console.info(data.email); // TypeScript knows data is User
}
```

### Built-in Type Guards

```typescript
// ✅ typeof narrowing
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + input; // padding is number
  }
  return padding + input; // padding is string
}

// ✅ instanceof narrowing
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.info(x.toUTCString()); // x is Date
  } else {
    console.info(x.toUpperCase()); // x is string
  }
}

// ✅ in operator narrowing
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    return animal.swim(); // animal is Fish
  }
  return animal.fly(); // animal is Bird
}

// ✅ Truthiness narrowing
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === 'object') {
    for (const s of strs) {
      // strs is string[]
      console.info(s);
    }
  } else if (typeof strs === 'string') {
    console.info(strs); // strs is string
  }
}
```

### Discriminated Unions

```typescript
// ✅ EXCELLENT: Discriminated unions for complex types
type Circle = {
  kind: 'circle';
  radius: number;
};

type Square = {
  kind: 'square';
  sideLength: number;
};

type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // shape is Circle
    case 'square':
      return shape.sideLength ** 2; // shape is Square
  }
}
```

---

## 4. Strict Mode Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true, // Enable all strict checks
    "noImplicitAny": true, // No implicit any types
    "strictNullChecks": true, // Null/undefined must be explicit
    "strictFunctionTypes": true, // Strict function type checking
    "strictBindCallApply": true, // Strict bind/call/apply
    "strictPropertyInitialization": true, // Class properties must be initialized
    "noImplicitThis": true, // No implicit this
    "alwaysStrict": true, // Parse in strict mode
    "noUnusedLocals": true, // Report unused locals
    "noUnusedParameters": true, // Report unused parameters
    "noImplicitReturns": true, // All code paths must return
    "noFallthroughCasesInSwitch": true, // No fallthrough in switch
    "skipLibCheck": true, // Skip type checking of .d.ts files
    "esModuleInterop": true, // Better module interop
    "allowSyntheticDefaultImports": true, // Allow default imports
    "forceConsistentCasingInFileNames": true // Case-sensitive imports
  }
}
```

---

## 5. Type Definition Patterns

### Interfaces vs Type Aliases

```typescript
// ✅ Use type aliases for unions, primitives, mapped types
type Status = 'active' | 'inactive';
type ID = string | number;
type Nullable<T> = T | null;

// ✅ Use interfaces for object shapes (preferred for performance)
type User = {
  id: number;
  email: string;
  name: string;
};

// ✅ Extend with intersection
type Admin = User & {
  role: 'admin';
  permissions: string[];
};
```

### Index Signatures

```typescript
// ✅ GOOD: For objects with dynamic keys
type Dictionary = {
  [key: string]: string | undefined;
};

// ✅ GOOD: With known properties
type Config = {
  apiUrl: string;
  [feature: string]: boolean | string | undefined;
};
```

### Mapped Types

```typescript
// ✅ GOOD: Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// ✅ GOOD: Make all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// ✅ GOOD: Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// ✅ GOOD: Omit specific properties
type UserWithoutPassword = Omit<User, 'password'>;
```

---

## 6. Union Types & Discriminated Unions

### Basic Union Types

```typescript
// ✅ GOOD: Union of primitives
type Result = 'success' | 'error' | 'pending';

// ✅ GOOD: Union of complex types
type Response = SuccessResponse | ErrorResponse;

// ✅ GOOD: Nullable types
type NullableString = string | null | undefined;
```

### Discriminated Unions (Tagged Unions)

```typescript
// ✅ EXCELLENT: Type-safe discriminated unions
type ApiSuccess<T> = {
  status: 'success';
  data: T;
};

type ApiError = {
  status: 'error';
  error: string;
  code: number;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type-safe handling
function handleResponse<T>(response: ApiResponse<T>) {
  if (response.status === 'success') {
    console.info(response.data); // TypeScript knows response.data exists
  } else {
    console.error(response.error); // TypeScript knows response.error exists
  }
}
```

---

## 7. Generic Types

### Generic Functions

```typescript
// ✅ GOOD: Generic function with constraints
function identity<T>(arg: T): T {
  return arg;
}

// ✅ GOOD: Generic function with multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// ✅ GOOD: Generic with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Generic React Components

```typescript
// ✅ GOOD: Generic component
type SelectProps<T> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption: (option: T) => React.ReactNode;
};

const Select = <T,>({ options, value, onChange, renderOption }: SelectProps<T>) => {
  return (
    <select value={String(value)} onChange={e => onChange(options[+e.target.value])}>
      {options.map((option, index) => (
        <option key={index} value={index}>
          {renderOption(option)}
        </option>
      ))}
    </select>
  );
};
```

### Generic Hooks

```typescript
// ✅ EXCELLENT: Type-safe custom hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### Type-Safe API Calls with Zod, apiFetch, and React Query

```typescript
// Schema: web/lib/schemas/import.ts
export const ImportSessionSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  status: ImportStatusSchema,
});
export type ImportSession = z.infer<typeof ImportSessionSchema>;

// API: web/lib/api/imports.ts
export async function getImportSession(role: UserRole, id: string): Promise<ImportSession> {
  return apiFetch<ImportSession>(`/imports/${id}`, { userRole: role, cache: 'no-store' });
}

// Hook: web/hooks/useImports.ts
export function useImportSession(id: string | null) {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: importKeys.detail(id ?? ''),
    queryFn: () => {
      if (!user || !id) throw new Error('Not authenticated');
      return getImportSession(user.role, id);
    },
    enabled: !!user && !!id,
  });
}
```

---

## 8. Utility Types

### Built-in Utility Types

```typescript
// ✅ Partial - Make all properties optional
type PartialUser = Partial<User>;

// ✅ Required - Make all properties required
type RequiredConfig = Required<Config>;

// ✅ Readonly - Make all properties readonly
type ReadonlyUser = Readonly<User>;

// ✅ Pick - Pick specific properties
type UserCredentials = Pick<User, 'email' | 'password'>;

// ✅ Omit - Omit specific properties
type UserPublic = Omit<User, 'password' | 'email'>;

// ✅ Record - Create object type with specific keys
type PageInfo = Record<'home' | 'about' | 'contact', { title: string; path: string }>;

// ✅ Exclude - Exclude types from union
type NonNullable<T> = Exclude<T, null | undefined>;

// ✅ Extract - Extract types from union
type StringOrNumber = Extract<string | number | boolean, string | number>;

// ✅ ReturnType - Extract return type
type Result = ReturnType<typeof myFunction>;

// ✅ Parameters - Extract parameter types
type Params = Parameters<typeof myFunction>;
```

### Custom Utility Types

```typescript
// ✅ GOOD: Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ✅ GOOD: Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// ✅ GOOD: Nullable type
type Nullable<T> = T | null;

// ✅ GOOD: Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

## 9. ESLint Rules for Type Safety

### Essential Rules (lawyer Project)

```javascript
// eslint.config.js
{
  rules: {
    // ❌ NEVER allow explicit any
    '@typescript-eslint/no-explicit-any': 'error',

    // ❌ NEVER allow non-null assertions (!)
    '@typescript-eslint/no-non-null-assertion': 'error',

    // ❌ Disallow unnecessary type assertions
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // ✅ Prefer optional chaining
    '@typescript-eslint/prefer-optional-chain': 'error',

    // ✅ Require await for promises
    '@typescript-eslint/await-thenable': 'error',

    // ✅ Check for floating promises
    '@typescript-eslint/no-floating-promises': 'error',

    // ✅ Require return types for functions
    '@typescript-eslint/explicit-function-return-type': 'warn',

    // ✅ Prefer type imports
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' }
    ],

    // ✅ Enforce exhaustive switch cases
    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    // ✅ Disallow unsafe member access
    '@typescript-eslint/no-unsafe-member-access': 'error',

    // ✅ Disallow unsafe calls
    '@typescript-eslint/no-unsafe-call': 'error',

    // ✅ Restrict template expressions
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNumber: true,
        allowBoolean: true,
        allowAny: false
      }
    ],
  }
}
```

---

## 10. Common Anti-Patterns

### ❌ Anti-Pattern 1: Overuse of `any`

```typescript
// ❌ BAD
function processData(data: any) {
  return data.value.toString();
}

// ✅ GOOD
type DataInput = {
  value: string | number;
};

function processData(data: DataInput): string {
  return String(data.value);
}
```

### ❌ Anti-Pattern 2: Type Assertions Instead of Proper Types

```typescript
// ❌ BAD
const user = fetchUser() as User;
const items = data.items as Item[];

// ✅ GOOD
// 1. Define proper return types
async function fetchUser(): Promise<User> {
  const response = await fetch('/api/user');
  return response.json();
}

// 2. Use type guards
function isUserArray(data: unknown): data is User[] {
  return Array.isArray(data) && data.every((item) => 'id' in item && 'email' in item);
}

const data = await fetchData();
if (isUserArray(data)) {
  // data is User[]
}
```

### ❌ Anti-Pattern 3: Missing Null Checks

```typescript
// ❌ BAD
function greet(name?: string) {
  return `Hello, ${name.toUpperCase()}!`; // Runtime error if name is undefined
}

// ✅ GOOD
function greet(name?: string): string {
  return `Hello, ${name?.toUpperCase() ?? 'Guest'}!`;
}

// ✅ BETTER: Non-nullable parameter
function greet(name: string): string {
  return `Hello, ${name.toUpperCase()}!`;
}
```

### ❌ Anti-Pattern 4: Implicit Any from Missing Return Types

```typescript
// ❌ BAD - Return type is implicit any
function getData(id) {
  return fetch(`/api/data/${id}`).then((r) => r.json());
}

// ✅ GOOD - Explicit return type
async function getData(id: string): Promise<DataType> {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}
```

### ❌ Anti-Pattern 5: String Literal Types Instead of Union Types

```typescript
// ❌ BAD
type Status = string;

function setStatus(status: Status) {
  // No type safety
}

// ✅ GOOD
type Status = 'pending' | 'active' | 'completed' | 'failed';

function setStatus(status: Status) {
  // Type-safe, autocomplete works
}
```

---

## Real-World Examples from lawyer

### Example 1: Inventory Type Safety

```typescript
// ✅ EXCELLENT: Proper type definition matching backend
export type InventoryItem = {
  id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    keyword?: string | null; // Added after discovering backend returns this
  } | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  created_at: string;
  is_active: boolean;
};

// ✅ EXCELLENT: Type-safe converter function
const convertToTableRow = useCallback((item: InventoryItem): InventoryTableRow => {
  return {
    id: item.id,
    product_id: item.product_id,
    product_keyword: item.product?.keyword || null, // No type assertion needed!
    product_name: item.product?.keyword || item.product?.name || 'Unknown Product',
    quantity_on_hand: item.quantity_on_hand,
    quantity_reserved: item.quantity_reserved,
    created_at: item.created_at,
    is_active: item.is_active,
    is_existing: true,
    is_editing: false,
  };
}, []);
```

### Example 2: API Response Type Safety

```typescript
// ✅ EXCELLENT: Generic type safety with axios
const response = await axiosClient.patch<InventoryItem>(`${API_INVENTORY.INVENTORY_ITEMS}${row.id}/`, {
  quantity_on_hand: row.quantity_on_hand,
});

const updatedItem = response.data; // Typed as InventoryItem

// No type assertion needed - use directly
setTableRows((prevRows) => prevRows.map((r) => (r.id === row.id ? convertToTableRow(updatedItem) : r)));
```

### Example 3: Discriminated Union for API Responses

```typescript
// ✅ EXCELLENT: Type-safe API response handling
type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; error: string; code: number };

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { status: 'success', data };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 500,
    };
  }
}

// Type-safe usage
const result = await fetchData<User>('/api/user');
if (result.status === 'success') {
  console.info(result.data.email); // TypeScript knows data exists
} else {
  console.error(result.error); // TypeScript knows error exists
}
```

---

## Performance Considerations

### 1. Prefer Interfaces Over Intersections

```typescript
// ❌ SLOWER: Intersection types
type Foo = Bar &
  Baz & {
    someProp: string;
  };

// ✅ FASTER: Interface with extends
type Foo = Bar &
  Baz & {
    someProp: string;
  };
```

### 2. Name Complex Types

```typescript
// ❌ SLOWER: Inline complex types
interface SomeType<T> {
  foo<U>(x: U): U extends TypeA<T> ? ProcessTypeA<U, T> : U extends TypeB<T> ? ProcessTypeB<U, T> : U;
}

// ✅ FASTER: Named type alias
type FooResult<U, T> = U extends TypeA<T> ? ProcessTypeA<U, T> : U extends TypeB<T> ? ProcessTypeB<U, T> : U;

interface SomeType<T> {
  foo<U>(x: U): FooResult<U, T>;
}
```

### 3. Use Type Annotations on Return Types

```typescript
// ❌ SLOWER: Inferred return types (for complex functions)
function processData(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    // ... 20 more properties
  }));
}

// ✅ FASTER: Explicit return type
function processData(items: Item[]): ProcessedItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    // ... 20 more properties
  }));
}
```

---

## Checklist for Type-Safe Code

### Before Submitting Code

- [ ] Zero `as` type assertions (except `as const`)
- [ ] All functions have explicit return types
- [ ] No `any` types (check ESLint)
- [ ] Null/undefined properly handled with `?` or `??`
- [ ] Backend types match frontend types exactly
- [ ] Type guards used for runtime checks
- [ ] Discriminated unions for complex type scenarios
- [ ] Generics used for reusable components/functions
- [ ] ESLint TypeScript rules passing
- [ ] No TypeScript compilation errors
- [ ] Optional chaining (`?.`) used where appropriate
- [ ] Nullish coalescing (`??`) preferred over `||`

---

## Quick Reference

### Type Narrowing

| Technique           | Use Case                | Example                        |
| ------------------- | ----------------------- | ------------------------------ |
| `typeof`            | Primitive type checking | `typeof x === 'string'`        |
| `instanceof`        | Class instance checking | `x instanceof Date`            |
| `in`                | Property existence      | `'prop' in obj`                |
| Type predicate      | Custom type guards      | `obj is Type`                  |
| Truthiness          | Null/undefined checks   | `if (value)`                   |
| Discriminated union | Tagged types            | `if (shape.kind === 'circle')` |

### Utility Types

| Type            | Description                      | Example                      |
| --------------- | -------------------------------- | ---------------------------- |
| `Partial<T>`    | Make all properties optional     | `Partial<User>`              |
| `Required<T>`   | Make all properties required     | `Required<Config>`           |
| `Readonly<T>`   | Make all properties readonly     | `Readonly<User>`             |
| `Pick<T, K>`    | Pick specific properties         | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>`    | Omit specific properties         | `Omit<User, 'password'>`     |
| `Record<K, T>`  | Object with specific keys        | `Record<string, number>`     |
| `ReturnType<T>` | Extract function return type     | `ReturnType<typeof fn>`      |
| `Parameters<T>` | Extract function parameter types | `Parameters<typeof fn>`      |

---

## Additional Resources

### Official Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript ESLint](https://typescript-eslint.io/)

### Performance

- [TypeScript Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance)
- [Preferring Interfaces Over Intersections](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections)

### Best Practices

- [Avoiding anys with Linting and TypeScript](https://typescript-eslint.io/blog/avoiding-anys)
- [The unknown type in TypeScript](https://mariusschulz.com/blog/the-unknown-type-in-typescript)

---

## Version History

| Version | Date        | Changes                                                         |
| ------- | ----------- | --------------------------------------------------------------- |
| 1.0     | Dec 3, 2025 | Initial document based on LocationInventoryManager improvements |

---

**Related Documents:**

- [Frontend Best Practices](./best-practice-frontend.md)
- [Backend Best Practices](./best-practice-backend.md)
- [Code Standards](../web/docs/code-standards.md)
