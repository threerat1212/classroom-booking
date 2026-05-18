> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# UX/UI Design Pattern Guide

> Copy-paste patterns for common UI needs. All use Tailwind CSS.

---

## 1. Page Layout - Sidebar + Content

```tsx
<div className='flex h-screen'>
  {/* Sidebar */}
  <aside className='w-60 shrink-0 border-r border-gray-200 bg-white'>
    <nav className='flex flex-col gap-1 p-4'>
      <NavItem
        href='/dashboard'
        icon={Home}
        active
      >
        Dashboard
      </NavItem>
      <NavItem
        href='/orders'
        icon={ShoppingCart}
      >
        Orders
      </NavItem>
    </nav>
  </aside>

  {/* Main Content */}
  <main className='flex-1 overflow-y-auto bg-gray-50 p-6'>
    <div className='mx-auto max-w-7xl'>{children}</div>
  </main>
</div>
```

---

## 2. Page Header

```tsx
<div className='flex items-center justify-between'>
  <div>
    <h1 className='text-2xl font-bold text-gray-900'>Page Title</h1>
    <p className='mt-1 text-sm text-gray-500'>Description of this page</p>
  </div>
  <Button variant='primary'>
    <Plus className='mr-2 h-4 w-4' />
    Create New
  </Button>
</div>
```

---

## 3. Card

```tsx
<div className='rounded-lg border border-gray-200 bg-white p-6'>
  <div className='flex items-center justify-between'>
    <h3 className='text-base font-semibold text-gray-900'>Card Title</h3>
    <Badge variant='success'>Active</Badge>
  </div>
  <p className='mt-2 text-sm text-gray-500'>Card description text here.</p>
  <div className='mt-4 flex justify-end gap-2'>
    <Button
      variant='ghost'
      size='sm'
    >
      Cancel
    </Button>
    <Button
      variant='primary'
      size='sm'
    >
      Save
    </Button>
  </div>
</div>
```

---

## 4. Card Grid

```tsx
<div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
  {items.map((item) => (
    <div
      key={item.id}
      className='rounded-lg border border-gray-200 bg-white p-4'
    >
      <div className='text-sm font-medium text-gray-500'>{item.label}</div>
      <div className='mt-1 text-2xl font-bold text-gray-900'>{item.value}</div>
      <div className='mt-1 text-xs text-green-600'>+{item.trend}%</div>
    </div>
  ))}
</div>
```

---

## 5. Data Table

```tsx
<div className='overflow-hidden rounded-lg border border-gray-200'>
  <table className='w-full'>
    <thead>
      <tr className='bg-gray-50'>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Name</th>
        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
        <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Actions</th>
      </tr>
    </thead>
    <tbody className='divide-y divide-gray-200'>
      {items.map((item) => (
        <tr
          key={item.id}
          className='hover:bg-gray-50'
        >
          <td className='px-4 py-3 text-sm text-gray-900'>{item.name}</td>
          <td className='px-4 py-3'>
            <Badge variant={item.statusVariant}>{item.status}</Badge>
          </td>
          <td className='px-4 py-3 text-right'>
            <button className='text-gray-400 hover:text-gray-600'>
              <MoreHorizontal className='h-4 w-4' />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 6. Filter Bar (Above Table)

```tsx
<div className='flex items-center justify-between gap-4'>
  <div className='flex items-center gap-2'>
    <div className='relative'>
      <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
      <input
        type='text'
        placeholder='Search...'
        className='rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      />
    </div>
    <select className='rounded-lg border border-gray-200 px-3 py-2 text-sm'>
      <option>All Status</option>
      <option>Active</option>
      <option>Inactive</option>
    </select>
  </div>
  <Button
    variant='primary'
    size='sm'
  >
    Add New
  </Button>
</div>
```

---

## 7. Status Badge

```tsx
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const Badge = ({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
  >
    {children}
  </span>
);
```

---

## 8. Form Layout

```tsx
<form className='mx-auto max-w-2xl space-y-6'>
  {/* Field */}
  <div>
    <label className='block text-sm font-medium text-gray-700'>
      Name <span className='text-red-500'>*</span>
    </label>
    <input
      type='text'
      className='mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
    />
    {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
  </div>

  {/* Actions */}
  <div className='flex justify-end gap-3 border-t border-gray-200 pt-4'>
    <Button variant='secondary'>Cancel</Button>
    <Button
      variant='primary'
      type='submit'
    >
      Save
    </Button>
  </div>
</form>
```

---

## 9. Modal / Dialog

```tsx
<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
  <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl'>
    {/* Header */}
    <div className='flex items-center justify-between'>
      <h2 className='text-lg font-semibold text-gray-900'>Modal Title</h2>
      <button
        onClick={onClose}
        className='text-gray-400 hover:text-gray-600'
      >
        <X className='h-5 w-5' />
      </button>
    </div>

    {/* Content */}
    <div className='mt-4'>
      <p className='text-sm text-gray-500'>Modal content goes here.</p>
    </div>

    {/* Footer */}
    <div className='mt-6 flex justify-end gap-3'>
      <Button
        variant='secondary'
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button variant='primary'>Confirm</Button>
    </div>
  </div>
</div>
```

---

## 10. Confirm Delete Dialog

```tsx
<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
  <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-xl'>
    <div className='flex flex-col items-center text-center'>
      <div className='rounded-full bg-red-50 p-3'>
        <AlertTriangle className='h-6 w-6 text-red-500' />
      </div>
      <h3 className='mt-4 text-lg font-semibold text-gray-900'>Delete Item?</h3>
      <p className='mt-2 text-sm text-gray-500'>
        This action cannot be undone. This will permanently delete the item.
      </p>
    </div>
    <div className='mt-6 flex gap-3'>
      <Button
        variant='secondary'
        className='flex-1'
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        variant='danger'
        className='flex-1'
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  </div>
</div>
```

---

## 11. Empty State

```tsx
<div className='flex flex-col items-center justify-center py-16 text-center'>
  <div className='rounded-full bg-gray-100 p-4'>
    <Inbox className='h-8 w-8 text-gray-400' />
  </div>
  <h3 className='mt-4 text-base font-semibold text-gray-900'>No items yet</h3>
  <p className='mt-1 max-w-sm text-sm text-gray-500'>Get started by creating your first item.</p>
  <Button
    variant='primary'
    className='mt-4'
  >
    <Plus className='mr-2 h-4 w-4' />
    Create Item
  </Button>
</div>
```

---

## 12. Loading Skeleton

```tsx
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

// Table skeleton
<div className="space-y-3">
  <Skeleton className="h-10 w-full" /> {/* Header */}
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>

// Card skeleton
<div className="rounded-lg border border-gray-200 p-4">
  <Skeleton className="h-4 w-24" />
  <Skeleton className="mt-2 h-8 w-16" />
  <Skeleton className="mt-2 h-3 w-20" />
</div>
```

---

## 13. Pagination

```tsx
<div className='flex items-center justify-between border-t border-gray-200 px-4 py-3'>
  <p className='text-sm text-gray-500'>
    Showing {start} to {end} of {total} results
  </p>
  <div className='flex gap-1'>
    <button
      disabled={page === 1}
      className='rounded px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50'
    >
      Previous
    </button>
    {pages.map((p) => (
      <button
        key={p}
        className={`rounded px-3 py-1 text-sm ${p === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
      >
        {p}
      </button>
    ))}
    <button
      disabled={page === lastPage}
      className='rounded px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50'
    >
      Next
    </button>
  </div>
</div>
```

---

## 14. Responsive Sidebar (Mobile)

```tsx
{
  /* Desktop sidebar */
}
<aside className='hidden w-60 shrink-0 border-r border-gray-200 md:block'>
  <SidebarContent />
</aside>;

{
  /* Mobile overlay */
}
{
  isOpen && (
    <div className='fixed inset-0 z-40 md:hidden'>
      <div
        className='fixed inset-0 bg-black/50'
        onClick={close}
      />
      <aside className='fixed inset-y-0 left-0 w-60 bg-white shadow-xl'>
        <SidebarContent />
      </aside>
    </div>
  );
}

{
  /* Hamburger button */
}
<button
  className='md:hidden'
  onClick={toggle}
>
  <Menu className='h-6 w-6' />
</button>;
```

---

## Pattern Selection

| I need to...             | Use Pattern                                    |
| ------------------------ | ---------------------------------------------- |
| Show a list with actions | #5 Data Table + #6 Filter Bar + #13 Pagination |
| Create/edit something    | #8 Form Layout                                 |
| Show stats               | #4 Card Grid                                   |
| Confirm dangerous action | #10 Confirm Delete Dialog                      |
| Show no data             | #11 Empty State                                |
| Async content            | #12 Loading Skeleton                           |
| Switch view on mobile    | #14 Responsive Sidebar                         |
