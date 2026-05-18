## Management System Notice

This repository targets a Lawyer management system.

---
name: web-css-refactoring
description: Narrow web helper for CSS cleanup and Tailwind-to-CSS-module refactors. Use after a primary root skill when you need style organization, responsive CSS cleanup, or component styling standardization.
argument-hint: "Describe the CSS refactor scope and target components"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# CSS Refactoring Guide

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Converting inline Tailwind classes to CSS modules
- Organizing CSS properties in the correct order
- Implementing responsive designs
- Creating reusable style patterns
- Refactoring existing component styles
- Adding desktop-first breakpoints

## ⚠️ CRITICAL: Desktop-First Responsive Design

**This project uses DESKTOP-FIRST responsive design. Use `max-md:` and `max-sm:` breakpoints, NOT `sm:`, `md:`, `lg:`.**

### ❌ WRONG - Mobile-First (Don't Use)

```css
/* ❌ WRONG - Mobile-first breakpoints */
.container {
  @apply flex-col; /* Mobile default */
  @apply md:flex-row; /* Desktop override */
}
```

### ✅ CORRECT - Desktop-First

```css
/* ✅ CORRECT - Desktop-first breakpoints */
.container {
  @apply flex-row; /* Desktop default */
  @apply max-md:flex-col; /* Tablet and below override */
}
```

## Structured Refactoring Workflow

<workflow>
  <step id="1" name="analyze-component">
    <description>Understand current styling</description>
    <actions>
      - Identify all inline Tailwind classes
      - Group by element/concern
      - Note responsive requirements
      - Identify repeated patterns
    </actions>
  </step>

  <step id="2" name="create-css-module">
    <description>Set up CSS module file</description>
    <actions>
      - Create file: componentName.module.css
      - Name classes semantically (not index.module.css)
      - Plan class hierarchy
    </actions>
  </step>

  <step id="3" name="organize-properties">
    <description>Apply CSS property ordering</description>
    <actions>
      - Follow the 10-category ordering
      - Group related properties
      - Add responsive overrides last
    </actions>
  </step>

  <step id="4" name="update-component">
    <description>Apply CSS module to component</description>
    <actions>
      - Import CSS module
      - Replace inline classes with module classes
      - Keep dynamic classes inline if needed
    </actions>
  </step>

  <step id="5" name="verify-styling">
    <description>Test visual output</description>
    <actions>
      - Check desktop view
      - Check tablet view (max-md breakpoint)
      - Check mobile view (max-sm breakpoint)
      - Verify no styling regressions
    </actions>
  </step>
</workflow>

## CSS Property Ordering

### The 10-Category Order

```css
.element {
  /* 1. Layout & Display */
  @apply flex items-center justify-between;
  @apply relative;
  @apply z-10;
  @apply overflow-hidden;

  /* 2. Position */
  @apply top-0 left-0;
  @apply inset-0;

  /* 3. Dimensions */
  @apply h-auto w-full;
  @apply max-w-md min-w-0;
  @apply aspect-video;

  /* 4. Spacing (Margin) */
  @apply m-4;
  @apply mt-2 mb-4;

  /* 5. Border */
  @apply border-default border;
  @apply rounded-lg;
  @apply ring-primary ring-2;

  /* 6. Padding */
  @apply p-4;
  @apply px-6 py-3;

  /* 7. Background */
  @apply bg-white;
  @apply from-primary to-secondary bg-gradient-to-r;

  /* 8. Typography */
  @apply text-lg-semibold text-primary;
  @apply font-medium;
  @apply leading-tight;
  @apply text-center;

  /* 9. Effects & Decorations */
  @apply shadow-md;
  @apply opacity-80;
  @apply cursor-pointer;

  /* 10. Transitions & Animations */
  @apply transition-colors duration-200;
  @apply hover:bg-primary-light;

  /* 11. Responsive Overrides (ALWAYS LAST) */
  @apply max-md:flex-col max-md:gap-2;
  @apply max-sm:p-2 max-sm:text-sm;
}
```

## Breakpoint Reference

### Project Breakpoints

| Breakpoint        | Class Prefix | Screen Width |
| ----------------- | ------------ | ------------ |
| Desktop (default) | (none)       | ≥1280px      |
| Laptop            | `max-xl:`    | <1280px      |
| Tablet            | `max-md:`    | <744px       |
| Mobile            | `max-sm:`    | <430px       |

### Common Responsive Patterns

```css
/* Layout switching */
.container {
  @apply flex flex-row gap-6;
  @apply max-md:flex-col max-md:gap-4;
}

/* Grid columns */
.grid {
  @apply grid grid-cols-4 gap-4;
  @apply max-md:grid-cols-2;
  @apply max-sm:grid-cols-1;
}

/* Typography scaling */
.title {
  @apply text-3xl-bold;
  @apply max-md:text-2xl-bold;
  @apply max-sm:text-xl-bold;
}

/* Spacing reduction */
.section {
  @apply p-8;
  @apply max-md:p-6;
  @apply max-sm:p-4;
}

/* Hide/Show elements */
.desktopOnly {
  @apply block;
  @apply max-md:hidden;
}

.mobileOnly {
  @apply hidden;
  @apply max-md:block;
}
```

## CSS Module Structure

### File Naming

```
src/components/
└── UserCard/
    ├── index.tsx
    ├── userCard.module.css   ✅ CORRECT - Descriptive name
    └── index.test.tsx

# ❌ WRONG - Generic names
└── Card/
    ├── index.tsx
    └── index.module.css      ❌ WRONG - Too generic
```

### Class Naming Conventions

```css
/* ✅ CORRECT - Semantic, descriptive names */
.root {
} /* Root container */
.header {
} /* Header section */
.title {
} /* Main title */
.subtitle {
} /* Secondary title */
.content {
} /* Main content area */
.actions {
} /* Action buttons container */
.primaryAction {
} /* Primary action button */

/* ❌ WRONG - Generic or abbreviated names */
.container {
} /* Too generic */
.btn {
} /* Abbreviated */
.txt {
} /* Unclear */
.sec1 {
} /* Numbered sections */
```

## Complete Refactoring Example

### Before: Inline Tailwind

```tsx
// ❌ Before - Inline styles are hard to maintain
export const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg max-md:gap-3 max-md:p-4'>
      <div className='flex items-center gap-3'>
        <img
          className='h-12 w-12 rounded-full object-cover'
          src={user.avatar}
          alt={user.name}
        />
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold text-gray-900'>{user.name}</h3>
          <p className='text-sm text-gray-500'>{user.role}</p>
        </div>
      </div>
      <p className='line-clamp-2 text-base text-gray-700'>{user.bio}</p>
      <div className='mt-auto flex gap-2'>
        <button className='bg-primary hover:bg-primary-dark flex-1 rounded-lg px-4 py-2 text-white transition-colors'>
          Follow
        </button>
        <button className='flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50'>
          Message
        </button>
      </div>
    </div>
  );
};
```

### After: CSS Module

```css
/* userCard.module.css */
.root {
  /* Layout */
  @apply flex flex-col;
  /* Dimensions */
  @apply gap-4;
  /* Border */
  @apply rounded-xl border border-gray-200;
  /* Padding */
  @apply p-6;
  /* Background */
  @apply bg-white;
  /* Effects */
  @apply shadow-md;
  /* Transitions */
  @apply transition-shadow;
  @apply hover:shadow-lg;
  /* Responsive */
  @apply max-md:gap-3 max-md:p-4;
}

.header {
  @apply flex items-center;
  @apply gap-3;
}

.avatar {
  @apply h-12 w-12;
  @apply rounded-full;
  @apply object-cover;
}

.info {
  @apply flex flex-col;
}

.name {
  @apply text-lg font-semibold text-gray-900;
}

.role {
  @apply text-sm text-gray-500;
}

.bio {
  @apply text-base text-gray-700;
  @apply line-clamp-2;
}

.actions {
  @apply flex;
  @apply gap-2;
  @apply mt-auto;
}

.primaryButton {
  @apply flex-1;
  @apply rounded-lg;
  @apply px-4 py-2;
  @apply bg-primary text-white;
  @apply transition-colors;
  @apply hover:bg-primary-dark;
}

.secondaryButton {
  @apply flex-1;
  @apply rounded-lg border border-gray-300;
  @apply px-4 py-2;
  @apply transition-colors;
  @apply hover:bg-gray-50;
}
```

```tsx
// ✅ After - Clean component with CSS module
import styles from './userCard.module.css';

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={user.avatar}
          alt={user.name}
        />
        <div className={styles.info}>
          <h3 className={styles.name}>{user.name}</h3>
          <p className={styles.role}>{user.role}</p>
        </div>
      </div>
      <p className={styles.bio}>{user.bio}</p>
      <div className={styles.actions}>
        <button className={styles.primaryButton}>Follow</button>
        <button className={styles.secondaryButton}>Message</button>
      </div>
    </div>
  );
};
```

## Combining CSS Module with Dynamic Classes

```tsx
import styles from './button.module.css';
import clsx from 'clsx';

type ButtonProps = {
  variant: 'primary' | 'secondary';
  isLoading?: boolean;
  className?: string;
};

export const Button = ({ variant, isLoading, className }: ButtonProps) => {
  return (
    <button
      className={clsx(
        styles.root,
        styles[variant], // Dynamic variant from module
        isLoading && styles.loading,
        className // Allow external overrides
      )}
    />
  );
};
```

## Common Patterns

### Card Pattern

```css
.card {
  @apply flex flex-col;
  @apply gap-4;
  @apply border-default rounded-xl border;
  @apply p-6;
  @apply bg-white;
  @apply shadow-sm;
  @apply max-md:gap-3 max-md:p-4;
}
```

### Section Pattern

```css
.section {
  @apply w-full;
  @apply mx-auto max-w-7xl;
  @apply px-6;
  @apply py-12;
  @apply max-md:px-4 max-md:py-8;
}
```

### Form Input Pattern

```css
.input {
  @apply w-full;
  @apply rounded-lg border border-gray-300;
  @apply px-4 py-3;
  @apply bg-white;
  @apply text-base text-gray-900;
  @apply placeholder:text-gray-400;
  @apply transition-colors;
  @apply focus:border-primary focus:ring-primary/20 focus:ring-2;
  @apply disabled:cursor-not-allowed disabled:bg-gray-100;
}
```

## Checklist Before Committing

- [ ] **CSS module file named descriptively** - Not index.module.css
- [ ] **Properties ordered correctly** - Following 10-category order
- [ ] **Desktop-first breakpoints** - Using max-md:, max-sm:
- [ ] **Responsive breakpoints last** - After all other properties
- [ ] **Semantic class names** - Descriptive, not abbreviated
- [ ] **No conflicting Tailwind classes** - Lint passes
- [ ] **Tested at all breakpoints** - Desktop, tablet, mobile

## Quick Reference

| Category    | Example Classes                             |
| ----------- | ------------------------------------------- |
| Layout      | `flex`, `grid`, `relative`, `z-10`          |
| Position    | `top-0`, `left-0`, `inset-0`                |
| Dimensions  | `w-full`, `h-auto`, `min-w-0`               |
| Margin      | `m-4`, `mt-2`, `mx-auto`                    |
| Border      | `border`, `rounded-lg`, `ring-2`            |
| Padding     | `p-4`, `px-6`, `py-3`                       |
| Background  | `bg-white`, `bg-primary`                    |
| Typography  | `text-lg`, `font-bold`, `text-center`       |
| Effects     | `shadow-md`, `opacity-80`, `cursor-pointer` |
| Transitions | `transition-colors`, `hover:bg-primary`     |
| Responsive  | `max-md:flex-col`, `max-sm:hidden`          |
