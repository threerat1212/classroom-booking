## Management System Notice

This repository targets a Lawyer management system.

---
name: web-performance-optimization
description: Narrow web helper for React and Next.js performance details. Use after a primary root skill when you need bundle, rendering, lazy-loading, or Lighthouse-focused optimization guidance.
argument-hint: "Describe the performance bottleneck and optimization goal"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Performance Optimization Guide

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Debugging slow component renders
- Reducing JavaScript bundle size
- Implementing code splitting and lazy loading
- Optimizing images and assets
- Improving Core Web Vitals (LCP, FID, CLS)
- Reducing unnecessary re-renders

## ⚠️ CRITICAL: Measure Before Optimizing

**Always measure performance before and after optimization. Premature optimization is the root of all evil.**

```bash
# Profile production build
pnpm build && pnpm start

# Use React DevTools Profiler
# Use Lighthouse in Chrome DevTools
# Use Next.js Analytics
```

## React Rendering Optimization

### Avoid Unnecessary Re-renders

```tsx
// ❌ WRONG - Creates new object every render
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <Child
      style={{ color: 'red' }} // New object every render!
      onClick={() => console.log('click')} // New function every render!
    />
  );
};

// ✅ CORRECT - Stable references
const Parent = () => {
  const [count, setCount] = useState(0);

  const style = useMemo(() => ({ color: 'red' }), []);
  const handleClick = useCallback(() => console.log('click'), []);

  return (
    <Child
      style={style}
      onClick={handleClick}
    />
  );
};
```

### memo for Expensive Components

```tsx
// Wrap components that render often but rarely change
const ExpensiveList = memo(({ items, onSelect }: Props) => {
  return (
    <ul>
      {items.map((item) => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
});

// With custom comparison
const ExpensiveComponent = memo(
  ({ data }: Props) => <div>{/* ... */}</div>,
  (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
);
```

### useMemo for Expensive Calculations

```tsx
// ❌ WRONG - Recalculates every render
const Component = ({ items }) => {
  const sorted = items.slice().sort((a, b) => b.score - a.score);
  const filtered = sorted.filter((item) => item.active);
  const top10 = filtered.slice(0, 10);

  return <List items={top10} />;
};

// ✅ CORRECT - Only recalculates when items change
const Component = ({ items }) => {
  const top10 = useMemo(() => {
    const sorted = items.slice().sort((a, b) => b.score - a.score);
    const filtered = sorted.filter((item) => item.active);
    return filtered.slice(0, 10);
  }, [items]);

  return <List items={top10} />;
};
```

### useCallback for Stable Callbacks

```tsx
// ❌ WRONG - Child re-renders every time
const Parent = () => {
  const handleClick = (id: string) => {
    console.log('clicked', id);
  };

  return <Child onClick={handleClick} />;
};

// ✅ CORRECT - Stable callback reference
const Parent = () => {
  const handleClick = useCallback((id: string) => {
    console.log('clicked', id);
  }, []);

  return <Child onClick={handleClick} />;
};
```

## Code Splitting

### Dynamic Imports

```tsx
// Lazy load components
import dynamic from 'next/dynamic';

// Basic lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// With loading state
const ChartComponent = dynamic(() => import('./ChartComponent'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR for client-only components
});

// Load on interaction
const Modal = dynamic(() => import('./Modal'));

const Page = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </>
  );
};
```

### Route-based Splitting

```tsx
// Next.js automatically code-splits by route
// Each page in app/ is a separate chunk

// For heavy page sections, use lazy loading
const DashboardCharts = dynamic(() => import('./DashboardCharts'));

export default function DashboardPage() {
  return (
    <div>
      <DashboardHeader />
      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts />
      </Suspense>
    </div>
  );
}
```

## Image Optimization

### Next.js Image Component

```tsx
import Image from 'next/image';

// Responsive image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Fill container
<div className="relative h-64">
  <Image
    src="/background.jpg"
    alt=""
    fill
    sizes="100vw"
    style={{ objectFit: 'cover' }}
  />
</div>

// Responsive sizes
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
/>
```

### Lazy Loading Images

```tsx
// Native lazy loading (for non-critical images)
<img src="/image.jpg" alt="..." loading="lazy" />

// Next.js - lazy by default unless priority is set
<Image
  src="/below-fold.jpg"
  alt="..."
  width={400}
  height={300}
  loading="lazy" // Default
/>
```

## Bundle Size Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
pnpm add -D @next/bundle-analyzer

# next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true pnpm build
```

### Import Optimization

```tsx
// ❌ WRONG - Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ CORRECT - Import specific function
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// ❌ WRONG - Imports all icons
import * as Icons from 'lucide-react';

// ✅ CORRECT - Import specific icons
import { Search, Menu, X } from 'lucide-react';
```

### Tree Shaking

```tsx
// Ensure named exports for tree shaking
// ✅ GOOD - Tree shakeable
export const Button = () => <button />;
export const Input = () => <input />;

// ❌ BAD - Not tree shakeable
export default {
  Button: () => <button />,
  Input: () => <input />,
};
```

## Core Web Vitals

### LCP (Largest Contentful Paint)

```tsx
// Preload critical resources
<Head>
  <link
    rel="preload"
    href="/fonts/main.woff2"
    as="font"
    type="font/woff2"
    crossOrigin="anonymous"
  />
</Head>

// Priority for hero images
<Image src="/hero.jpg" priority alt="..." />

// Inline critical CSS with Tailwind
// (handled automatically by Next.js)
```

### FID/INP (First Input Delay / Interaction to Next Paint)

```tsx
// Defer non-critical JavaScript
<Script
  src='https://analytics.example.com/script.js'
  strategy='lazyOnload'
/>;

// Use Web Workers for heavy computation
const worker = new Worker('/workers/heavyTask.js');
worker.postMessage(data);
worker.onmessage = (e) => setResult(e.data);
```

### CLS (Cumulative Layout Shift)

```tsx
// ✅ Always set dimensions on images
<Image
  src="/image.jpg"
  width={400}
  height={300}
  alt="..."
/>

// ✅ Reserve space for dynamic content
<div className="min-h-50">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// ✅ Use aspect-ratio for responsive containers
<div className="aspect-video">
  <Image src="/video-thumb.jpg" fill alt="..." />
</div>
```

## List Virtualization

```tsx
// For long lists, use virtualization
import { FixedSizeList } from 'react-window';

const VirtualList = ({ items }) => (
  <FixedSizeList
    height={600}
    width='100%'
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => <div style={style}>{items[index].name}</div>}
  </FixedSizeList>
);
```

## Caching Strategies

### Server-side Caching

```tsx
// Static generation
export const dynamic = 'force-static';

// Revalidate periodically
export const revalidate = 3600; // 1 hour

// On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

// In Server Action
revalidatePath('/products');
revalidateTag('products');
```

### Client-side Caching

```tsx
// SWR with caching
import useSWR from 'swr';

const { data } = useSWR('/api/user', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
});
```

## Profiling Tools

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Interact with the app
5. Stop recording
6. Analyze flame graph

### Lighthouse

```bash
# Run Lighthouse CI
npx lighthouse http://localhost:3000 --output html --view

# Or use Chrome DevTools:
# 1. Open DevTools
# 2. Go to Lighthouse tab
# 3. Select categories
# 4. Click Analyze
```

## Checklist for Performance

- [ ] **Images optimized** - Using next/image with proper sizes
- [ ] **Code split** - Heavy components loaded dynamically
- [ ] **Bundle analyzed** - No unnecessary large dependencies
- [ ] **Memoization** - memo/useMemo/useCallback where needed
- [ ] **Lists virtualized** - Long lists use react-window
- [ ] **Fonts optimized** - Using next/font
- [ ] **Core Web Vitals** - LCP, FID/INP, CLS within thresholds
- [ ] **Third-party scripts** - Loaded with appropriate strategy

## Quick Reference

| Optimization     | When to Use                            |
| ---------------- | -------------------------------------- |
| `memo()`         | Component receives same props often    |
| `useMemo()`      | Expensive calculation with stable deps |
| `useCallback()`  | Callback passed to memoized child      |
| `dynamic()`      | Heavy component not needed immediately |
| `priority`       | Above-the-fold images                  |
| `loading="lazy"` | Below-the-fold images                  |
| `react-window`   | Lists with 100+ items                  |
| `revalidate`     | Data that changes periodically         |
