> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# UX/UI Design Process Guide

> 6-phase process for designing or redesigning a page/feature.

---

## Overview

```
Discovery (15%) -> Research (20%) -> Analysis (15%) -> Design (20%) -> Implement (20%) -> Validate (10%)
```

---

## Phase 1: Discovery (15%)

**Goal**: Understand what you're building and why.

**Do:**

- [ ] What is the purpose of this page/feature?
- [ ] Who uses it? (admin, customer, both?)
- [ ] What are the key user tasks?
- [ ] What data needs to be displayed?
- [ ] What actions can the user take?
- [ ] Are there existing patterns in the app to follow?

**Output**: A clear list of requirements and user tasks.

---

## Phase 2: Research (20%)

**Goal**: Look at how similar things are done.

**Do:**

- [ ] Check existing pages in the app for consistent patterns
- [ ] Look at how similar products solve this (Shopify, Google, etc.)
- [ ] Review the [Pattern Guide](./ux-ui-design-pattern-guide.md) for reusable patterns
- [ ] Identify any technical constraints (API limitations, data structure)

**Output**: Reference screenshots/links and chosen patterns.

---

## Phase 3: Analysis (15%)

**Goal**: Plan the structure before writing code.

**Do:**

- [ ] Sketch the layout (paper or whiteboard is fine)
- [ ] Define the component tree (what components exist, what's new)
- [ ] Map user flows (happy path + error path + empty state)
- [ ] Decide responsive behavior (what changes on mobile?)
- [ ] List all states: loading, empty, error, populated, selected

**Output**: Layout sketch + component list + state list.

---

## Phase 4: Design (20%)

**Goal**: Build the UI structure with placeholder data.

**Do:**

- [ ] Start with layout (pick from [Pattern Guide](./ux-ui-design-pattern-guide.md))
- [ ] Apply visual hierarchy (title > subtitle > body > caption)
- [ ] Use project color palette (see [Color Guide](./ux-ui-color-principles-guide.md))
- [ ] Build all states (loading, empty, error, populated)
- [ ] Check against [Rules Guide](./ux-ui-rule-guide.md) as you build

**Tips:**

- Build desktop first, then adapt for mobile
- Use real-ish data, not "Lorem ipsum"
- Keep it simple: fewer elements = better

---

## Phase 5: Implementation (20%)

**Goal**: Connect to real data and finalize interactions.

**Do:**

- [ ] Connect API using typed `web/lib/api/*` functions and React Query hooks
- [ ] Implement loading/error/empty states
- [ ] Add form validation (React Hook Form + Zod)
- [ ] Implement responsive behavior (`max-md:`, `max-sm:`)
- [ ] Add keyboard navigation and focus management
- [ ] Test with real data scenarios

**Code standards:**

- Tailwind CSS for styling
- CSS Modules for complex component-scoped styles
- TypeScript strict (no `any`)
- Named arrow function components

---

## Phase 6: Validation (10%)

**Goal**: Verify quality before merge.

**Do:**

- [ ] Run through [Checklist Guide](./ux-ui-design-checklist-guide.md)
- [ ] Test: desktop + tablet + mobile
- [ ] Test: happy path + error + empty state
- [ ] Check accessibility: keyboard navigation + contrast
- [ ] No console errors/warnings
- [ ] Ask: "Would I be confused by this as a new user?"

---

## Common Mistakes

| Mistake                                | Fix                                  |
| -------------------------------------- | ------------------------------------ |
| Starting with code, no plan            | Spend 15% on Discovery first         |
| Copying a complex design from Dribbble | Use project patterns for consistency |
| Only building the happy path           | Build ALL states from the start      |
| Desktop only                           | Build responsive from Phase 4        |
| No loading states                      | Add skeletons/spinners for all async |
| Complex forms on one page              | Break into steps if > 8 fields       |
| Inconsistent spacing                   | Use Tailwind spacing scale only      |

---

## Time Guide

| Task                             | Suggested Split                |
| -------------------------------- | ------------------------------ |
| Simple component (button, badge) | 10% plan, 80% build, 10% test  |
| Page with table/list             | 20% plan, 50% build, 30% test  |
| Complex form (multi-step)        | 30% plan, 40% build, 30% test  |
| Full feature (CRUD)              | 25% plan, 45% build, 30% test  |
| Redesign existing page           | 30% audit, 40% build, 30% test |
