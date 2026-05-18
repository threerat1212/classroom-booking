---
name: component-architecture
description: "Frontend component architecture skill for this repository. Use for three-tier UI structure, shadcn-first composition, and reusable app-level design system patterns in web/."
argument-hint: "Describe the component architecture change or review target"
---

# SKILL: Component Architecture & Design System

For full workflow context, see `docs/project-workflow.md`.

## Scope
Apply this skill when building frontend UI components for the Lawyer management system. Ensures all components follow a reusable, app-level design system pattern using shadcn/ui.

## When to Use
- Creating new UI components (tables, forms, modals, filters, etc.)
- Building feature-specific component wrappers
- Extending existing components with new functionality
- Reviewing component pull requests

## Three-Tier Architecture

### Tier 1: App-Level Design System (`web/components/ui/` + `web/components/`)
**Purpose**: Generic, reusable components with zero domain logic.

**Owned by shadcn/ui**:
- `components/ui/button.tsx` — shadcn Button
- `components/ui/table.tsx` — shadcn Table
- `components/ui/select.tsx` — shadcn Select
- `components/ui/checkbox.tsx` — shadcn Checkbox
- `components/ui/input.tsx` — shadcn Input
- `components/ui/dialog.tsx` — shadcn Dialog (modal)
- `components/ui/drawer.tsx` — shadcn Drawer (side panel)
- `components/ui/card.tsx` — shadcn Card
- `components/ui/badge.tsx` — shadcn Badge
- `components/ui/alert.tsx` — shadcn Alert
- `components/ui/skeleton.tsx` — shadcn Skeleton

**Custom app-level wrappers** (built on shadcn/ui):
- `components/data-table.tsx` — Table with sorting, selection, pagination
- `components/empty-state.tsx` — Empty state display
- `components/error-state.tsx` — Error display with retry
- `components/selection-bar.tsx` — Multi-select control bar
- `components/pagination.tsx` — Pagination controls
- `components/form/` — Form field primitives (input, select, checkbox, etc.)

**Characteristics**:
- No hardcoded domain values
- Generic type parameters (T for table data, etc.)
- Accept props for customization
- Reusable across multiple features

### Tier 2: Feature-Specific Wrappers (`web/components/<feature>/`)
**Purpose**: Adapt app-level components to specific domains.

**Examples**:
- `components/debt-management/debtors-table.tsx` — Uses DataTable with debtor columns
- `components/assignments/assignments-table.tsx` — Uses DataTable with assignment columns
- `components/debt-management/debtors-filter-bar.tsx` — Debtor filters using form inputs

**Characteristics**:
- Wraps app-level components
- Contains feature business logic
- Adds domain-specific styling
- May call custom hooks (useDebtorsList, etc.)

### Tier 3: Page Components (`web/app/[lang]/(app)/<feature>/page.tsx`)
**Purpose**: Orchestrate feature pages and layout.

**Characteristics**:
- Server Components that read params/searchParams
- Delegate rendering to feature wrappers
- Handle metadata and SEO

## Implementation Rules

### Adding New Components

**Step 1: Check if it exists**
- Search `web/components/` for similar functionality
- Check shadcn/ui registry (https://ui.shadcn.com/docs/components)

**Step 2: Use shadcn/ui as base**
```bash
# Install from shadcn/ui if available
pnpm dlx shadcn@latest add <component-name> --yes
```

**Step 3: Wrap or extend**
- If generic: place in `web/components/` or `web/components/ui/`
- If feature-specific: place in `web/components/<feature>/`

**Step 4: Accept generic props**
```tsx
// ✅ GOOD: Generic, reusable
interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onSort?: (column: keyof T, order: 'asc' | 'desc') => void;
}

// ❌ BAD: Hardcoded domain
interface DebtorsTableProps {
  debtors: Debtor[];
}
```

### Naming
- **App-level**: lowercase + hyphens (`data-table.tsx`, `empty-state.tsx`)
- **Feature-level**: feature-prefix + component name (`debtors-table.tsx`)
- **Exports**: PascalCase (`DataTable`, `EmptyState`)

### Imports
```tsx
// UI library (from shadcn/ui)
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';

// App-level wrappers (custom)
import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';

// Feature wrappers
import { DebtorsTable } from '@/components/debt-management/debtors-table';
```

## Anti-Patterns

❌ **Feature-specific components with identical code**
```tsx
// DON'T: Duplicate table logic
function DebtorsTable() { return <table>...</table>; }
function AssignmentsTable() { return <table>...</table>; }
```

✅ **Single app-level component + feature wrappers**
```tsx
// DO: Reuse DataTable with different data
function DebtorsTable() { return <DataTable columns={...} data={...} />; }
function AssignmentsTable() { return <DataTable columns={...} data={...} />; }
```

❌ **Hardcoded messages in components**
```tsx
// DON'T: Feature-specific messaging
export function DebtorsTableEmpty() {
  return <div>No debtors found. <button>Create debtor</button></div>;
}
```

✅ **Generic messaging via props**
```tsx
// DO: Pass messaging as props
export function EmptyState({ title, description, action }) {
  return <div>{title}. {description} <button>{action.label}</button></div>;
}
```

## Migration Path

### Migrating existing feature-specific components to app-level:

1. **Identify duplicates**: Multiple features using similar UI patterns
2. **Generalize**: Extract generic logic, remove hardcoded values
3. **Export from app-level**: Move to `web/components/`
4. **Create feature wrappers**: Thin layer that provides domain data
5. **Remove old files**: Delete feature-specific component duplicates

**Example**:
```tsx
// OLD: components/debt-management/debtors-table.tsx (hardcoded)
export function DebtorsTable() {
  return <table><th>Contract No</th>...</table>;
}

// NEW: components/data-table.tsx (generic)
export function DataTable<T>({ columns, data }) {
  return <table>{columns.map(col => <th>{col.header}</th>)}</table>;
}

// NEW: components/debt-management/debtors-table.tsx (wrapper)
export function DebtorsTable() {
  const columns: DataTableColumn<Debtor>[] = [
    { key: 'contract_no', header: 'Contract No' },
    // ...
  ];
  return <DataTable columns={columns} data={data} />;
}
```

## Common Tasks

### Adding a new app-level component

```tsx
// 1. Check shadcn/ui registry
// 2. Install from shadcn if available
pnpm dlx shadcn@latest add my-component --yes

// 3. If wrapping shadcn, create in web/components/
// 4. Accept generic props, no hardcoding
// 5. Document with example usage
```

### Creating a feature wrapper

```tsx
// 1. Import app-level component
import { DataTable } from '@/components/data-table';

// 2. Define feature-specific columns/handlers
const columns: DataTableColumn<Debtor>[] = [...];

// 3. Fetch feature data via hook
const { data } = useDebtorsList(filters);

// 4. Compose and return
export function DebtorsTable() {
  return <DataTable columns={columns} data={data.items} />;
}
```

## Validation Checklist

Before submitting component PR:

- [ ] Component is reusable (2+ features use it or will use it)
- [ ] Generic props, no hardcoded domain values
- [ ] Built on shadcn/ui (if UI pattern)
- [ ] Placed in correct tier (app-level vs feature)
- [ ] Named correctly (lowercase + hyphens for files)
- [ ] Exports PascalCase for React components
- [ ] Documentation with usage example
- [ ] TypeScript types are generic/extensible
- [ ] No console.logs or debugging code

## Resources

- **shadcn/ui docs**: https://ui.shadcn.com/docs/components
- **Component architecture reference**: `docs/design-system/COMPONENT-ARCHITECTURE.md`
- **Example patterns**: `web/components/data-table.tsx`, `web/components/debt-management/debtors-table.tsx`

## Related Skills
- None currently

## Version
1.0.0 - May 16, 2026
