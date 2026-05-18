## Management System Notice

This repository targets a Lawyer management system.

---
name: responsive-design
description: Desktop-first responsive design patterns for this project using Tailwind CSS. Use when writing or reviewing CSS/Tailwind classes for layout, spacing, typography, or visibility. Triggers on tasks involving responsive layouts, breakpoints, mobile adaption, or Tailwind utility classes.
argument-hint: "Describe the responsive layout issue and target breakpoints"
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# Desktop-First Responsive Design

For full workflow context, see `docs/project-workflow.md`.

## CRITICAL: Desktop-First Approach

Write desktop styles as default, then override for smaller screens with `max-*` breakpoints. **Never** use mobile-first `sm:`, `md:`, `lg:` prefixes.

```css
/* ❌ WRONG — Mobile-first */
.container { @apply flex-col gap-2 p-4 md:flex-row md:gap-4 lg:p-8; }

/* ✅ CORRECT — Desktop-first */
.container { @apply flex-row gap-6 p-8 max-md:flex-col max-md:gap-4 max-sm:p-4; }
```

## Breakpoints

| Breakpoint | Tailwind Prefix | Screen Width |
|-----------|----------------|-------------|
| Desktop | (none — default) | ≥1280px |
| Laptop | `max-xl:` | <1280px |
| Tablet | `max-md:` | <744px |
| Mobile | `max-sm:` | <430px |

## Common Patterns

```css
/* Layout direction */
.layout { @apply flex flex-row gap-6 max-md:flex-col max-md:gap-4; }

/* Grid columns: 4 → 2 → 1 */
.grid { @apply grid grid-cols-4 gap-6 max-md:grid-cols-2 max-sm:grid-cols-1; }

/* Sidebar — pushes below content on mobile */
.sidebar { @apply w-64 shrink-0 max-md:order-2 max-md:w-full; }
.content { @apply flex-1 max-md:order-1; }

/* Typography scaling */
.title { @apply text-4xl font-bold max-md:text-3xl max-sm:text-2xl; }

/* Spacing reduction */
.section { @apply px-8 py-16 max-md:px-6 max-md:py-12 max-sm:px-4 max-sm:py-8; }

/* Show/Hide */
.desktopOnly { @apply block max-md:hidden; }
.mobileOnly { @apply hidden max-md:block; }
```

## Component Examples

### Responsive Card
```css
.card { @apply flex flex-row gap-6 rounded-xl border p-6 max-md:flex-col max-md:gap-4 max-md:p-4; }
.image { @apply h-32 w-48 shrink-0 rounded-lg object-cover max-md:h-48 max-md:w-full; }
```

### Responsive Header
```css
.header { @apply flex items-center justify-between h-16 px-8 border-b max-md:h-14 max-md:px-4; }
.nav { @apply flex gap-8 max-md:hidden; }
.mobileMenuButton { @apply hidden max-md:block; }
```

### Responsive Table
```css
.tableWrapper { @apply overflow-x-auto; }
.table { @apply w-full min-w-150; }
```

## Quick Reference

| Pattern | Desktop | Tablet (`max-md`) | Mobile (`max-sm`) |
|---------|---------|-------------------|-------------------|
| Layout | `flex-row` | `max-md:flex-col` | |
| Grid | `grid-cols-4` | `max-md:grid-cols-2` | `max-sm:grid-cols-1` |
| Padding | `p-8` | `max-md:p-6` | `max-sm:p-4` |
| Gap | `gap-6` | `max-md:gap-4` | `max-sm:gap-3` |
| Font | `text-4xl` | `max-md:text-3xl` | `max-sm:text-2xl` |
| Show | `block` | `max-md:hidden` | |
| Hide | `hidden` | `max-md:block` | |

## Debugging

Order matters — larger breakpoints first:
```css
/* ❌ WRONG */ .el { @apply max-sm:p-2 max-md:p-4; }
/* ✅ CORRECT */ .el { @apply p-6 max-md:p-4 max-sm:p-2; }
```

Avoid conflicting classes: `.el { @apply flex-row max-md:flex-col; }` (not both `flex-row` and `flex-col`).

Test at: 1280px (Desktop), 1024px (Laptop), 744px (Tablet), 430px (Mobile), 375px (Small mobile).

## Checklist

- [ ] Desktop styles are default (no breakpoint prefix)
- [ ] Using `max-md:`/`max-sm:` (NOT `sm:`/`md:`/`lg:`)
- [ ] Breakpoints in order: `max-md:` before `max-sm:`
- [ ] No horizontal scroll on any screen size
- [ ] Touch targets ≥ 44px on mobile
- [ ] Text readable (≥ 16px on mobile)
