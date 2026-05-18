> For full workflow context, see docs/project-workflow.md.

# Component Architecture & Design System

## Overview

This document defines the component organization strategy for the Lawyer management system frontend. Components are organized in **three tiers**: app-level design system, feature-specific wrappers, and page layouts.

## Component Tier Structure

### Tier 1: App-Level Design System (`web/components/`)

**Purpose**: Generic, reusable components that work across all features without domain knowledge.

**Key Characteristics**:
- No hardcoded domain logic or messaging
- Accept generic props (data, columns, filters, etc.)
- Can be used by any feature (debtors, assignments, calls, etc.)
- Based on **shadcn/ui** for consistent UX and accessibility
- Customizable styling to fit brand guidelines

**Examples**:
- `data-table.tsx` — Generic table with sorting, selection, pagination
- `empty-state.tsx` — Reusable empty state display
- `error-state.tsx` — Error display with retry action
- `data-table-skeleton.tsx` — Loading skeleton for tables
- `selection-bar.tsx` — Multi-select control bar
- `pagination.tsx` — Pagination controls
- `form-input.tsx`, `form-select.tsx`, `form-checkbox.tsx` — Form primitives
- `modal.tsx`, `drawer.tsx` — Overlay patterns

**Location Pattern**:
```
web/components/
  ├── data-table.tsx
  ├── empty-state.tsx
  ├── error-state.tsx
  ├── data-table-skeleton.tsx
  ├── selection-bar.tsx
  ├── pagination.tsx
  ├── modal.tsx
  ├── drawer.tsx
  ├── form/
  │   ├── form-input.tsx
  │   ├── form-select.tsx
  │   ├── form-checkbox.tsx
  │   └── form-date-picker.tsx
  └── ui/
      ├── button.tsx
      ├── card.tsx
      ├── badge.tsx
      └── ...
```

### Tier 2: Feature-Specific Wrappers (`web/components/<feature>/`)

**Purpose**: Adapt app-level components to specific feature domains (debtors, assignments, etc.).

**Key Characteristics**:
- Wraps app-level components with feature-specific logic
- May add domain-specific styling or validation
- Contains feature business logic (filtering, sorting state management)
- Clean separation: component rendering vs. data fetching

**Examples**:
- `components/debt-management/debtors-table.tsx` — Wraps `DataTable` with debtor columns and actions
- `components/debt-management/debtors-filter-bar.tsx` — Debtor-specific filters using generic form inputs
- `components/assignments/assignments-table.tsx` — Uses same `DataTable` but for assignment data

**Pattern**:
```tsx
// Feature wrapper uses generic component
import { DataTable } from '@/components/data-table';

export function DebtorsTable({ initialFilters }) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useDebtorsList(initialFilters);

  const columns: DataTableColumn<Debtor>[] = [
    {
      key: 'contract_no',
      header: 'Contract No',
      sortable: true,
      render: (value) => <span className='font-medium'>{value}</span>,
    },
    // ... more debtor-specific columns
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      keyExtractor={(row) => row.id}
      // ... pass generic handlers
    />
  );
}
```

### Tier 3: Page Components (`web/app/[lang]/(app)/<feature>/page.tsx`)

**Purpose**: Orchestrate feature pages with layout, page-level filters, and navigation.

**Key Characteristics**:
- Server Components that read route params and URL filters
- Pass filters to Client Components
- Handle metadata and SEO
- May use feature-specific `loading.tsx` and `error.tsx`

**Pattern**:
```tsx
// Server Component
export const metadata = { title: 'Debtors' };

export default async function DebtorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string[]>>;
}) {
  const filters = await parseFiltersFromSearchParams(searchParams);

  return (
    <>
      <PageHeader title='Debtors' description='...' />
      <DebtorsTable initialFilters={filters} />
    </>
  );
}
```

## shadcn/ui Integration

All app-level components are **built on shadcn/ui** components:

| App-Level Component | shadcn/ui Base | Customization |
|---|---|---|
| `DataTable` | `Table` + `Checkbox` | Add sorting, selection, pagination |
| `EmptyState` | Custom (illustration + text) | Brand-specific messaging |
| `ErrorState` | Custom (alert pattern) | Brand-specific error styling |
| `SelectionBar` | `Button` + spacing | Multi-action bar |
| `Pagination` | `Button` (custom) | Arrow-based pagination |
| Form inputs | `Input`, `Select`, `Checkbox` | Validation feedback |

## Import Organization

**App-level (generic)**:
```tsx
import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { SelectionBar } from '@/components/selection-bar';
```

**Feature-level**:
```tsx
import { DebtorsTable } from '@/components/debt-management/debtors-table';
import { useDebtorsList } from '@/hooks/useDebtors';
```

**UI library**:
```tsx
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
```

## Naming Conventions

- **App-level**: lowercase with hyphens (`data-table.tsx`, `empty-state.tsx`)
- **Feature-specific**: feature prefix + component name (`debtors-table.tsx`, `assignments-filter.tsx`)
- **Exports**: PascalCase for React components (`DataTable`, `EmptyState`)

## When to Add New Components

**Add to app-level if**:
- Component is used by 2+ features
- Component has no domain-specific logic
- Component solves a general UI problem (table, modal, form, etc.)

**Keep in feature-level if**:
- Component is used by only 1 feature
- Component wraps app-level components with business logic
- Component contains feature-specific validation or styling

## Anti-Patterns to Avoid

❌ **Feature-specific table component** (duplicate logic across features)
```tsx
// DON'T: Create duplicate components
export function DebtorsTable() { /* table UI */ }
export function AssignmentsTable() { /* same table UI */ }
```

✅ **Reusable app-level component + feature wrapper**
```tsx
// DO: Use generic DataTable + feature wrapper
export function DebtorsTable() {
  return <DataTable columns={debtorColumns} data={...} />;
}
export function AssignmentsTable() {
  return <DataTable columns={assignmentColumns} data={...} />;
}
```

❌ **Hardcoded empty state messaging**
```tsx
// DON'T: Hardcode "No debtors found"
export function DebtorsTableEmpty() {
  return <div>No debtors found</div>;
}
```

✅ **Generic empty state with configurable props**
```tsx
// DO: Pass messaging as props
export function DebtorsTable() {
  return (
    <EmptyState
      icon='📋'
      title='No debtors found'
      description='Try adjusting your filters or create a new debtor'
    />
  );
}
```

## Development Workflow

1. **Identify pattern**: Notice similar component needs across features
2. **Generalize**: Create app-level component with generic props
3. **Implement**: Build on shadcn/ui base with Tailwind customization
4. **Wrap**: Create feature-specific wrapper that provides domain data
5. **Reuse**: Use same app-level component in other features

## Styling & Customization

- Base styling: shadcn/ui defaults + Tailwind CSS
- Brand colors: Define in `tailwind.config.ts` (extend theme)
- Dark mode: Configure in shadcn/ui setup
- Custom tokens: Use CSS custom properties for theme values

## Migration from Old Pattern

If moving existing feature-specific components to app-level:

1. Extract generic logic (remove hardcoded values)
2. Accept props for messaging, columns, handlers
3. Export from `web/components/` instead of feature folder
4. Update feature wrapper to import and use new component
5. Remove old feature-specific component file

---

**Last Updated**: May 16, 2026  
**Next Review**: When adding 5+ new components
