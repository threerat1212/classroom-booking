> For full workflow context, see docs/project-workflow.md.

# Design System & shadcn/ui Documentation Update

**Completed**: May 16, 2026

## What Was Done

### 1. Component Architecture Documentation
Created comprehensive design system guide (`docs/design-system/COMPONENT-ARCHITECTURE.md`) that documents:
- **Three-tier component architecture**: App-level design system, feature-specific wrappers, page components
- **shadcn/ui integration**: How to use shadcn/ui as the base for all app-level components
- **Implementation rules**: When to add components at app vs feature level
- **Anti-patterns**: What NOT to do (hardcoded messaging, duplicate components, etc.)
- **Migration path**: How to move existing feature-specific components to app-level

### 2. shadcn/ui Installation
Installed 11 essential shadcn/ui components:
- ✅ button
- ✅ table
- ✅ select
- ✅ checkbox
- ✅ input
- ✅ dialog
- ✅ drawer
- ✅ card
- ✅ badge
- ✅ alert
- ✅ skeleton

Each installed one-by-one using `pnpm dlx shadcn@latest add <component> --yes`

### 3. App-Level Component Refactoring
Refactored debtors table to use generic app-level components built on shadcn/ui:
- Created `components/data-table.tsx` — Generic table with sorting, selection, pagination
- Created `components/empty-state.tsx` — Generic empty state display
- Created `components/error-state.tsx` — Generic error display
- Created `components/data-table-skeleton.tsx` — Generic loading skeleton
- Created `components/selection-bar.tsx` — Multi-select control bar
- Created `components/pagination.tsx` — Pagination controls
- Updated `components/debt-management/debtors-table.tsx` to use generic DataTable
- Deleted feature-specific components (debtors-table-empty.tsx, debtors-table-error.tsx, etc.)

### 4. AI Skill Documentation
Created `.github/skills/component-architecture/SKILL.md` — Complete skill guide for building UI components with:
- When to use the skill
- Three-tier architecture explained
- Implementation rules and checklists
- Anti-patterns to avoid
- Common tasks with code examples
- Validation checklist before PR

Updated `.github/skills/README.md` to include component-architecture in the frontend skills section.

### 5. Project Documentation
Updated multiple documentation files:
- **web/README.md** — Added shadcn/ui setup and component architecture sections
- **docs/TASK-REQUIREMENTS.md** — Added component architecture requirement section
- **docs/design-system/SHADCN-UI-SETUP.md** — New guide for shadcn/ui setup, usage, customization, and troubleshooting

## Key Design Principles Documented

### Three-Tier Architecture
1. **App-Level Design System** (`components/ui/` + `components/`)
   - Built on shadcn/ui
   - Generic, reusable, zero domain logic
   - Examples: DataTable, EmptyState, ErrorState, Pagination, SelectionBar

2. **Feature-Specific Wrappers** (`components/<feature>/`)
   - Wraps app-level components
   - Contains feature business logic
   - Examples: DebtorsTable, AssignmentsTable

3. **Page Components** (`app/[lang]/(app)/<feature>/page.tsx`)
   - Orchestrates feature pages
   - Handles routing and layout

### Why This Matters
- **Reusability**: Debtors, assignments, calls all use the same DataTable
- **Consistency**: All features have same UX patterns
- **Scalability**: Sustainable architecture for 50+ features
- **Maintainability**: Design changes apply across all features
- **Testing**: Generic components can be tested once, used everywhere

## Anti-Patterns Eliminated
❌ Feature-specific table components with duplicate code
❌ Hardcoded empty state messages
❌ Multiple implementations of the same UI pattern
❌ Feature-level error and loading states

## Build Validation
✅ Frontend builds successfully with shadcn/ui components
✅ All generic app-level components compile without errors
✅ DebtorsTable successfully uses DataTable component

## Next Steps
1. Use app-level components for all remaining features (assignments, calls, payments, etc.)
2. Install additional shadcn/ui components as needed (form, textarea, tabs, toast, etc.)
3. Create feature wrappers that use the generic design system
4. Maintain consistent UX across all management system features

## Resources
- Component Architecture: `docs/design-system/COMPONENT-ARCHITECTURE.md`
- shadcn/ui Setup: `docs/design-system/SHADCN-UI-SETUP.md`
- Component Architecture Skill: `.github/skills/component-architecture/SKILL.md`
- shadcn/ui Docs: https://ui.shadcn.com/docs/components
