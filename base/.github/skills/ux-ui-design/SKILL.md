## Management System Notice

This repository targets a Lawyer management system.

---
name: ux-ui-design
description: UX/UI design patterns, component conventions, and interaction guidelines for this project. Use when building or reviewing UI components, layouts, forms, tables, navigation, dashboards, or accessibility. Triggers on tasks involving visual design, component patterns, color usage, typography, spacing, or interaction design.
argument-hint: "Describe the UI component or interaction pattern to design or review"
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# UX/UI Design Guide

For full workflow context, see `docs/project-workflow.md`.

## Core Principles

| Principle | Rule |
|-----------|------|
| **Proximity** | Related items close, unrelated items far apart |
| **Progressive Disclosure** | Show only what's needed now, reveal more on demand |
| **Context Preservation** | Use modals/drawers, don't lose user's place |
| **Visual Hierarchy** | Size, color, weight guide the eye: Title > Subtitle > Body > Caption |
| **Reduce Cognitive Load** | Max 7 items visible; group related actions |
| **Feedback Loops** | Every action gets a response: loading, success, error |

## Nielsen's Heuristics (Applied)

| # | Heuristic | How |
|---|-----------|-----|
| 1 | Visibility of system status | Spinners, progress bars, toast notifications |
| 2 | Match real world | Use business terms (Order, SKU), not dev terms |
| 3 | User control & freedom | Undo, close modals with X/ESC/backdrop |
| 4 | Consistency & standards | Same button styles, icon meanings, color meanings |
| 5 | Error prevention | Disable invalid actions, confirm destructive ops, validate inline |
| 6 | Recognition over recall | Dropdowns, breadcrumbs, show current state |
| 7 | Flexibility & efficiency | Keyboard shortcuts, bulk actions, search/filter |
| 8 | Aesthetic minimal design | No decorative elements — every element has a purpose |
| 9 | Help users with errors | What happened + how to fix it |
| 10 | Help & documentation | Tooltips on complex fields, empty states with guidance |

## Color System

| Role | Tailwind |
|------|----------|
| Primary | `bg-primary text-primaryForeground` |
| Success | `bg-green-50 text-green-700` (badge) / `text-success` |
| Warning | `bg-amber-50 text-amber-700` |
| Danger | `bg-red-50 text-red-700` |
| Text Primary | `text-foreground` |
| Text Secondary | `text-textSecondary` |

**Rules**: 60-30-10 ratio. WCAG contrast 4.5:1 for text. Never use color alone — add icon or text.

## Typography Scale

| Level | Tailwind |
|-------|----------|
| Page Title | `text-2xl font-bold` |
| Section Title | `text-lg font-semibold` |
| Card Title | `text-base font-semibold` |
| Body | `text-sm` |
| Caption/Label | `text-xs font-medium` |

Max 2-3 font sizes per page. Max line width: 65-75 chars.

## Spacing (8px Grid)

`gap-2` (8px), `gap-3` (12px), `gap-4` (16px card padding), `gap-6` (24px sections), `gap-8` (32px page-level).

## Interaction Design

### Loading States
| Duration | Show |
|----------|------|
| < 300ms | Nothing |
| 300ms–1s | Spinner on element |
| > 1s | Skeleton placeholder |
| > 5s | Progress bar with message |

### Error Handling
- Inline validation below field immediately on blur
- Toast for action results (success 3s, error persistent, warning 5s)
- Full error page only for 404/500
- Always: what happened + how to fix it

### Confirmation Required For
Delete, bulk actions, irreversible changes. **Not** needed for: save, toggle, navigation.

## Component Patterns

### Buttons
| Type | When | Style |
|------|------|-------|
| Primary | Main action | `bg-primary text-primaryForeground` |
| Secondary | Alternative | `border border-border` |
| Danger | Destructive | `bg-danger text-white` |
| Ghost | Tertiary | `text-primary hover:bg-primary/10` |

One primary button per view. Destructive actions require confirmation dialog.

### Badges/Status
```
Active/Success   → bg-green-50 text-green-700
Pending/Warning  → bg-amber-50 text-amber-700
Error/Failed     → bg-red-50 text-red-700
Info/Default     → bg-blue-50 text-blue-700
Inactive/Draft   → bg-gray-100 text-gray-600
```

### Cards
```tsx
<div className="bg-surface rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
```

### Modals/Dialogs
- Max width: `max-w-lg` (forms), `max-w-sm` (confirmations)
- Close: X button + ESC key + backdrop click
- Destructive: "Are you sure?" with red confirm button
- Never nest modals — use multi-step within one modal

## Forms

- Label above input (not inline/floating)
- Required fields: label + asterisk `*`
- Validate on blur (not every keystroke)
- Show all errors at once; scroll to first error on submit
- Disable submit while submitting (with spinner)
- Single column, `max-w-2xl`

## Tables

- Sticky header, hover rows (`hover:bg-gray-50`)
- Alignment: text left, numbers right, actions right, checkbox center
- Filter above table; search top-left (debounced 300ms)
- Pagination bottom-right with total count and 10/25/50 per page
- Always provide empty state with action CTA

## Navigation

- **Sidebar**: 240px fixed, active `bg-blue-50 text-blue-700`, collapse on mobile
- **Breadcrumbs**: Detail/edit pages, max 3-4 levels, current page not clickable
- **Tabs**: Switching views of same content only — not for page navigation

## Dashboard Patterns

- KPI cards top row: `grid grid-cols-2 gap-4 md:grid-cols-4`
- Charts: `recharts`, max 2-3 per section, always title/axes/legend/empty state
- Tables: default sort, search, filters, pagination

## Accessibility Checklist

- [ ] All images have `alt` text (decorative: `alt=""`)
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI elements)
- [ ] Interactive elements keyboard accessible (Tab, Enter, Escape)
- [ ] Focus visible: `focus-visible:ring-2`
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers
- [ ] No information conveyed by color alone
- [ ] Modals trap focus and restore on close
- [ ] Min 44×44px touch targets

## Anti-Patterns (Avoid)

- Full page reload for actions → modals/drawers, update inline
- Color alone for status → add icon + label
- Multiple primary buttons per view → one main action
- Nested modals → multi-step within one modal
- Layout shift on data load → skeleton placeholders
- Tiny click targets (<44px) → min 44×44px
- Alert dialogs for routine ops → toast notifications

## Project Conventions

- CSS: Tailwind primary, CSS Modules for complex components. Desktop-first with `max-md:` / `max-sm:`
- Naming: `PascalCase` components, `useThing` hooks, `UPPER_SNAKE` constants
- API calls: always use typed `web/lib/api/*` functions backed by `apiFetch<T>()`; never direct axios/fetch outside `web/lib/http/client.ts`
