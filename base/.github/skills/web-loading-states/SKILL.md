## Management System Notice

This repository targets a Lawyer management system.

---
name: web-loading-states
description: Narrow web helper for loading states and skeleton UI. Use after a primary root skill when you need Suspense boundaries, placeholder patterns, or async content-state guidance.
argument-hint: "Describe the loading-state behavior and async UI context"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Loading States and Skeleton Components

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Creating loading states for async content
- Building skeleton loaders that match actual content
- Implementing Suspense boundaries
- Handling loading/error/success state patterns
- Creating shimmer effects for placeholders
- Preventing layout shift during loading

## ⚠️ CRITICAL: Boolean Flag Pattern

**Always use simple boolean flags for loading states. Do not derive loading from data absence.**

### ❌ WRONG - Deriving Loading from Data

```typescript
// ❌ WRONG - Unclear what !data means (loading? error? empty?)
const UserProfile = () => {
  const { data } = useFetch('/api/user');

  if (!data) {
    return <Skeleton />; // Is this loading or an error?
  }

  return <Profile user={data} />;
};
```

### ✅ CORRECT - Explicit Boolean Flag

```typescript
// ✅ CORRECT - Explicit states, clear meaning
const UserProfile = () => {
  const { data, isLoading, error } = useFetch('/api/user');

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <EmptyState />;
  }

  return <Profile user={data} />;
};
```

## Structured Implementation Workflow

<workflow>
  <step id="1" name="analyze-component">
    <description>Understand the component's structure</description>
    <actions>
      - Identify all content regions
      - Note dimensions of each element
      - Identify text line counts and lengths
      - Note any images or avatars
    </actions>
  </step>

  <step id="2" name="create-skeleton">
    <description>Build matching skeleton component</description>
    <actions>
      - Match exact layout structure
      - Match exact dimensions
      - Add pulse/shimmer animations
      - Ensure no layout shift
    </actions>
  </step>

  <step id="3" name="implement-state">
    <description>Add loading state handling</description>
    <actions>
      - Add isLoading boolean flag
      - Conditionally render skeleton
      - Handle error state
      - Handle empty state
    </actions>
  </step>

  <step id="4" name="verify">
    <description>Test loading behavior</description>
    <actions>
      - Verify skeleton matches content layout
      - Check no layout shift on load
      - Test error and empty states
    </actions>
  </step>
</workflow>

## ⚠️ CRITICAL: 100% Accurate Skeleton Layout

**Skeletons MUST match the exact layout of the loaded content to prevent layout shift.**

### ❌ WRONG - Skeleton Doesn't Match

```typescript
// ❌ WRONG - Different structure than actual content
const CardSkeleton = () => (
  <div className="p-4">
    <div className="h-4 w-full bg-gray-200 rounded" />
    <div className="h-4 w-3/4 bg-gray-200 rounded mt-2" />
  </div>
);

// Actual card has different structure!
const Card = ({ data }) => (
  <div className="p-4 flex gap-4">
    <img className="w-16 h-16 rounded-full" src={data.avatar} />
    <div>
      <h3 className="text-lg font-bold">{data.title}</h3>
      <p className="text-sm text-gray-500">{data.subtitle}</p>
    </div>
  </div>
);
```

### ✅ CORRECT - Skeleton Matches Exactly

```typescript
// ✅ CORRECT - Skeleton mirrors actual component structure
const CardSkeleton = () => (
  <div className="p-4 flex gap-4">
    {/* Avatar placeholder - same size as actual avatar */}
    <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
    <div className="flex-1">
      {/* Title placeholder - matches h3 height */}
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      {/* Subtitle placeholder - matches p height and position */}
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
    </div>
  </div>
);

const Card = ({ data }) => (
  <div className="p-4 flex gap-4">
    <img className="w-16 h-16 rounded-full" src={data.avatar} />
    <div className="flex-1">
      <h3 className="text-lg font-bold">{data.title}</h3>
      <p className="text-sm text-gray-500 mt-2">{data.subtitle}</p>
    </div>
  </div>
);
```

## Skeleton Building Blocks

### Basic Skeleton Elements

```tsx
// Reusable skeleton primitives
const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={clsx('animate-pulse rounded bg-gray-200', className)} />
);

const SkeletonCircle = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  return <div className={clsx('animate-pulse rounded-full bg-gray-200', sizes[size])} />;
};

const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={clsx(
          'h-4 animate-pulse rounded bg-gray-200',
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full' // Last line shorter
        )}
      />
    ))}
  </div>
);
```

### Complete Skeleton Example

```tsx
// Match this actual component:
const UserCard = ({ user }: { user: User }) => (
  <div className='flex gap-4 rounded-lg border p-4'>
    <img
      className='h-12 w-12 rounded-full'
      src={user.avatar}
      alt={user.name}
    />
    <div className='flex-1'>
      <h3 className='text-lg font-semibold'>{user.name}</h3>
      <p className='text-sm text-gray-500'>{user.role}</p>
      <p className='mt-2 line-clamp-2 text-sm text-gray-700'>{user.bio}</p>
    </div>
  </div>
);

// With this skeleton:
const UserCardSkeleton = () => (
  <div className='flex gap-4 rounded-lg border p-4'>
    {/* Avatar */}
    <div className='h-12 w-12 animate-pulse rounded-full bg-gray-200' />
    <div className='flex-1'>
      {/* Name */}
      <div className='h-6 w-32 animate-pulse rounded bg-gray-200' />
      {/* Role */}
      <div className='mt-1 h-4 w-24 animate-pulse rounded bg-gray-200' />
      {/* Bio - 2 lines */}
      <div className='mt-2 space-y-1'>
        <div className='h-4 w-full animate-pulse rounded bg-gray-200' />
        <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200' />
      </div>
    </div>
  </div>
);
```

## Next.js App Router Loading States

### loading.tsx File

```tsx
// app/users/loading.tsx
// Automatically shown while page.tsx loads
export default function Loading() {
  return (
    <div className='container py-8'>
      <div className='mb-6 h-8 w-48 animate-pulse rounded bg-gray-200' />
      <div className='grid grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

### Suspense Boundaries

```tsx
// Granular loading with Suspense
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div className='grid grid-cols-2 gap-6'>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}
```

## State Management Patterns

### Discriminated Union Pattern

```typescript
type DataState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const UserList = ({ state }: { state: DataState<User[]> }) => {
  switch (state.status) {
    case 'idle':
      return <EmptyState message="Click to load users" />;
    case 'loading':
      return <UserListSkeleton />;
    case 'error':
      return <ErrorState message={state.error} />;
    case 'success':
      if (state.data.length === 0) {
        return <EmptyState message="No users found" />;
      }
      return (
        <ul>
          {state.data.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </ul>
      );
  }
};
```

### React Query Pattern

```typescript
const UserList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) {
    return <UserListSkeleton count={5} />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No users found" />;
  }

  return (
    <ul>
      {data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Early Returns Before Loading Check

```typescript
// ❌ WRONG - Returns null during loading
const Component = ({ data, isLoading }) => {
  if (!data) return null; // This runs during loading!
  if (isLoading) return <Skeleton />; // Never reached when loading
  return <Content data={data} />;
};

// ✅ CORRECT - Check loading first
const Component = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton />;
  if (!data) return <EmptyState />;
  return <Content data={data} />;
};
```

### ❌ Anti-Pattern 2: Conditional Data Access

```typescript
// ❌ WRONG - Accessing data before checking loading
const Component = ({ data, isLoading }) => {
  const title = data?.items?.[0]?.title; // Runs during loading

  if (isLoading) return <Skeleton />;
  return <h1>{title}</h1>;
};

// ✅ CORRECT - Access data only after loading check
const Component = ({ data, isLoading }) => {
  if (isLoading) return <Skeleton />;

  const title = data?.items?.[0]?.title ?? 'No title';
  return <h1>{title}</h1>;
};
```

### ❌ Anti-Pattern 3: Generic Skeleton

```typescript
// ❌ WRONG - Generic skeleton doesn't match content
const Page = ({ isLoading, data }) => {
  if (isLoading) return <GenericSpinner />; // Causes layout shift!
  return <ComplexLayout data={data} />;
};

// ✅ CORRECT - Skeleton matches layout exactly
const Page = ({ isLoading, data }) => {
  if (isLoading) return <ComplexLayoutSkeleton />;
  return <ComplexLayout data={data} />;
};
```

## Shimmer Animation

```css
/* CSS for shimmer effect */
.shimmer {
  @apply relative overflow-hidden;
  @apply bg-gray-200;
}

.shimmer::after {
  content: '';
  @apply absolute inset-0;
  @apply -translate-x-full;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

```tsx
// Usage
const SkeletonWithShimmer = () => <div className='shimmer h-4 w-32 rounded' />;
```

## Checklist Before Committing

- [ ] **Loading check comes first** - Before any data access
- [ ] **Skeleton matches content exactly** - Same dimensions and structure
- [ ] **No layout shift** - Skeleton and content have identical layout
- [ ] **Error state handled** - Displays error message
- [ ] **Empty state handled** - Displays empty message
- [ ] **Boolean isLoading flag used** - Not derived from !data
- [ ] **Suspense boundaries used** - For independent loading sections

## Quick Reference

| State              | When                  | Display        |
| ------------------ | --------------------- | -------------- |
| `isLoading: true`  | Data is being fetched | Skeleton       |
| `error !== null`   | Fetch failed          | Error message  |
| `data === null/[]` | No data available     | Empty state    |
| `data` exists      | Data loaded           | Actual content |
