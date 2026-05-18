> For full workflow context, see docs/project-workflow.md.

# shadcn/ui Integration Guide

## Overview

The Lawyer management system uses **shadcn/ui** as the foundation for all app-level design system components. This guide explains the setup, available components, and how to extend them.

## Installation Status

### Installed Components

The following shadcn/ui components have been installed and are ready to use:

```
web/components/ui/
├── button.tsx       ✓ Basic button with variants
├── table.tsx        ✓ Table for data display
├── select.tsx       ✓ Dropdown select input
├── checkbox.tsx     ✓ Checkbox control
├── input.tsx        ✓ Text input field
├── dialog.tsx       ✓ Modal dialog
├── drawer.tsx       ✓ Side panel / drawer
├── card.tsx         ✓ Card container
├── badge.tsx        ✓ Label/badge
├── alert.tsx        ✓ Alert message
└── skeleton.tsx     ✓ Loading skeleton
```

### How They Were Installed

Each component was installed individually:

```bash
pnpm dlx shadcn@latest add button --yes
pnpm dlx shadcn@latest add table --yes
pnpm dlx shadcn@latest add select --yes
# ... and so on
```

## Component Base

All shadcn/ui components are built on:
- **UI Library**: Radix UI (unstyled, accessible primitives)
- **Styling**: Tailwind CSS v4
- **Preset**: Nova (modern, clean design)
- **Framework**: Next.js 16 App Router

## App-Level Wrappers

Built on top of shadcn/ui base components, custom wrappers provide feature-agnostic functionality:

| Wrapper | Base Components | Purpose |
|---------|---|---------|
| `DataTable` | `Table`, `Checkbox` | Sortable, selectable, paginated table |
| `EmptyState` | HTML + Tailwind | Generic empty state display |
| `ErrorState` | `Alert` + HTML | Error display with retry action |
| `SelectionBar` | `Button` | Multi-select control bar |
| `Pagination` | `Button` | Pagination controls |
| `DataTableSkeleton` | `Skeleton` | Loading skeleton for tables |

## Adding New Components from shadcn/ui

### Single Component
```bash
pnpm dlx shadcn@latest add <component-name> --yes
```

### Common Components to Add Later
```bash
# Forms
pnpm dlx shadcn@latest add form --yes
pnpm dlx shadcn@latest add textarea --yes

# Navigation
pnpm dlx shadcn@latest add tabs --yes
pnpm dlx shadcn@latest add breadcrumb --yes
pnpm dlx shadcn@latest add pagination --yes

# Data display
pnpm dlx shadcn@latest add popover --yes
pnpm dlx shadcn@latest add tooltip --yes

# Feedback
pnpm dlx shadcn@latest add toast --yes
pnpm dlx shadcn@latest add dropdown-menu --yes
```

## Using Components

### Importing shadcn/ui Components
```tsx
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select';
```

### Importing App-Level Wrappers
```tsx
import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SelectionBar } from '@/components/selection-bar';
import { Pagination } from '@/components/pagination';
```

### Example: Using DataTable

```tsx
import { DataTable, DataTableColumn } from '@/components/data-table';

export function DebtorsTable() {
  const columns: DataTableColumn<Debtor>[] = [
    {
      key: 'contract_no',
      header: 'Contract No',
      sortable: true,
    },
    {
      key: 'outstanding_balance',
      header: 'Balance',
      align: 'right',
      render: (value) => `฿${value.toLocaleString()}`,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(row) => row.id}
      onSort={handleSort}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
}
```

## Customization

### Tailwind Theme

shadcn/ui components use Tailwind CSS for styling. To customize colors, spacing, or other design tokens:

**File**: `tailwind.config.ts`
```ts
export default {
  theme: {
    extend: {
      colors: {
        // Add custom colors here
      },
    },
  },
};
```

### Component Styling

Components can be customized by:
1. Modifying Tailwind classes in `components/ui/*.tsx`
2. Adding CSS modules for complex styling
3. Using CSS variables for theme values

### Creating Custom Variants

```tsx
// In components/ui/button.tsx, add to cva() variants:
variants: {
  variant: {
    default: '...',
    primary: '...',
    custom: 'px-6 py-3 rounded-full bg-blue-600',
  },
}
```

## TypeScript Support

All shadcn/ui components are fully typed:

```tsx
// Button accepts standard HTML button props
<Button onClick={() => {}} disabled type="submit">
  Click me
</Button>

// Custom components accept generic types
<DataTable<Debtor> columns={...} data={...} />
```

## Accessibility

shadcn/ui components (built on Radix UI) include:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

No additional accessibility work needed for these primitives.

## Performance

Components are optimized for performance:
- Tree-shakeable exports
- Minimal bundle impact (~10KB gzipped for all installed components)
- No external dependencies beyond React and Tailwind

## Common Patterns

### Modal / Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog({ isOpen, onConfirm, onCancel }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>Are you sure?</DialogDescription>
        </DialogHeader>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Field
```tsx
import { Input } from '@/components/ui/input';

export function TextField({ label, value, onChange }) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium'>{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
```

### Dropdown
```tsx
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select';

export function FilterSelect({ options, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

## Migration from Old Patterns

If moving from custom components to shadcn/ui:

1. **Identify component needs**: Button, table, form inputs, modals, etc.
2. **Install shadcn component**: `pnpm dlx shadcn@latest add <name> --yes`
3. **Update imports**: Replace custom component with shadcn/ui component
4. **Test styling**: Verify Tailwind classes match brand guidelines
5. **Delete old files**: Remove replaced custom component files

## Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com/docs/components
- **Radix UI Primitives**: https://www.radix-ui.com/docs/primitives/overview/introduction
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Component Architecture Guide**: `docs/design-system/COMPONENT-ARCHITECTURE.md`

## Troubleshooting

### Component Not Appearing

1. Verify shadcn/ui is installed: Check `components/ui/<component>.tsx` exists
2. Check import path: Should be `@/components/ui/<component>`
3. Verify Tailwind CSS is loaded: Check `app/globals.css` includes Tailwind

### Styling Issues

1. Check `tailwind.config.ts` for theme extensions
2. Verify `components/ui/<component>.tsx` has correct Tailwind classes
3. Clear Next.js cache: `rm -rf .next && pnpm run dev`

### TypeScript Errors

1. Re-install component: `pnpm dlx shadcn@latest add <name> --yes --overwrite`
2. Verify Node version compatibility (Node 18+ required)
3. Check tsconfig.json has correct alias paths

---

**Last Updated**: May 16, 2026  
**shadcn/ui Version**: 4.7.0  
**Radix UI Preset**: Nova
