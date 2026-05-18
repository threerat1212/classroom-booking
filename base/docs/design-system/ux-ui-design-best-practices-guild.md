> For full workflow context, see docs/project-workflow.md.

# UX/UI Best Practices Guide

> Practical techniques for building good UI. For rules, see [Rules Guide](./ux-ui-rule-guide.md).

---

## 1. Layout

### Consistent Page Structure

```
[Page Header - Title + Actions]
[Content Area]
  [Filters/Search (if applicable)]
  [Main Content (table/cards/form)]
  [Pagination (if applicable)]
```

### Spacing

- Use 8px grid: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- Cards: `p-4` or `p-6` internal padding
- Between sections: `gap-6` or `gap-8`
- Between related items: `gap-2` or `gap-3`

### Alignment

- Left-align text (except numbers in tables: right-align)
- Right-align action buttons in forms and modals
- Center-align empty states

---

## 2. Visual Hierarchy

### Size Scale

- Page title: `text-2xl font-bold` (24px)
- Section title: `text-lg font-semibold` (18px)
- Card title: `text-base font-semibold` (16px)
- Body: `text-sm` (14px)
- Caption: `text-xs` (12px)

### Emphasis Techniques

| Technique  | Tailwind                       | When                        |
| ---------- | ------------------------------ | --------------------------- |
| Bold text  | `font-semibold` or `font-bold` | Titles, important values    |
| Color      | `text-blue-500`                | Links, interactive elements |
| Background | `bg-blue-50`                   | Selected/active states      |
| Size       | `text-lg` vs `text-sm`         | Hierarchy levels            |
| Opacity    | `text-gray-500`                | De-emphasize secondary info |

**Rule**: Max 3 levels of emphasis per view (primary, secondary, tertiary).

---

## 3. Interaction Design

### Clickable Elements

- Min 44x44px touch target
- Cursor: `cursor-pointer` for all clickable elements
- Hover state on every interactive element
- Focus ring: `focus-visible:ring-2 focus-visible:ring-blue-500`

### Loading States

| Duration   | Show                                  |
| ---------- | ------------------------------------- |
| < 300ms    | Nothing (avoid flash)                 |
| 300ms - 1s | Spinner on the button/element         |
| > 1s       | Skeleton placeholder for content area |
| > 5s       | Progress bar with message             |

### Error Handling

- Inline validation: show error below the field immediately
- Toast for action results (success/error)
- Full error page only for 404/500
- Always include: what happened + how to fix it

### Confirmation

- Required for: delete, bulk actions, irreversible changes
- Not needed for: save, toggle, navigation
- Pattern: Dialog with clear action description + red confirm button for destructive

---

## 4. Forms

### Field Layout

- Label above input (not inline, not floating)
- Required fields: label + asterisk (\*)
- Help text: below label, `text-xs text-gray-500`
- Error text: below input, `text-xs text-red-500`

### Validation

- Validate on blur (not on every keystroke)
- Show all errors at once (don't hide them)
- Scroll to first error on submit
- Disable submit button while submitting (with spinner)

### Field Sizing

- Single column for most forms (`max-w-2xl`)
- Short fields (phone, zip): control width to match expected input
- Full width for long text, addresses

---

## 5. Tables

### Structure

- Sticky header on scroll
- Alternating row colors optional (`even:bg-gray-50`)
- Hover: `hover:bg-gray-50`
- Horizontal scroll on overflow (don't hide columns)

### Column Guidelines

| Type          | Alignment      | Width |
| ------------- | -------------- | ----- |
| Text          | Left           | Auto  |
| Numbers       | Right          | Fixed |
| Status badges | Center or Left | Fixed |
| Actions       | Right          | Fixed |
| Checkbox      | Center         | 40px  |

### Features

- Sort: clickable column headers with sort indicator
- Filter: above table, not inline
- Search: top-left, debounced 300ms
- Pagination: bottom-right, show total count
- Empty state: centered message with action ("No orders yet. Create one.")

---

## 6. Navigation

### Sidebar

- Fixed width (240px desktop)
- Active item: `bg-blue-50 text-blue-700 font-medium`
- Hover: `hover:bg-gray-100`
- Icons + labels for each item
- Collapsible on mobile (hamburger menu)

### Breadcrumbs

- Show on detail/edit pages
- Format: `Home / Section / Current Page`
- Current page not clickable
- Max 3-4 levels

### Tabs

- Use for switching views of SAME content
- Active tab: underline + primary color
- Don't use for navigation between different pages

---

## 7. Cards

### Anatomy

```tsx
<div className='rounded-lg border border-gray-200 bg-white p-4'>
  <div className='flex items-center justify-between'>
    <h3 className='text-base font-semibold text-gray-900'>Title</h3>
    <Badge>Status</Badge>
  </div>
  <p className='mt-2 text-sm text-gray-500'>Description</p>
  <div className='mt-4 flex justify-end gap-2'>
    <Button variant='secondary'>Cancel</Button>
    <Button variant='primary'>Action</Button>
  </div>
</div>
```

### Grid Layouts

- 4 columns desktop, 2 tablet, 1 mobile: `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4`
- Consistent card height within a row when possible

---

## 8. Empty States

Every list/table/section needs an empty state:

```tsx
<div className='flex flex-col items-center justify-center py-12 text-center'>
  <Icon className='h-12 w-12 text-gray-300' />
  <h3 className='mt-2 text-sm font-semibold text-gray-900'>No items</h3>
  <p className='mt-1 text-sm text-gray-500'>Get started by creating your first item.</p>
  <Button
    className='mt-4'
    variant='primary'
  >
    Create Item
  </Button>
</div>
```

---

## 9. Toast Notifications

| Type    | Usage                      | Duration                   |
| ------- | -------------------------- | -------------------------- |
| Success | After completing an action | 3 seconds, auto-dismiss    |
| Error   | When an action fails       | Persistent until dismissed |
| Warning | Non-blocking caution       | 5 seconds                  |
| Info    | Neutral information        | 3 seconds                  |

Position: top-right. Max 3 visible at once. Stack vertically.

---

## 10. Performance as UX

- Images: use `next/image` with appropriate `sizes`
- Lists > 50 items: virtualize with `react-window`
- Debounce search inputs: 300ms
- Lazy load below-fold content
- Skeleton loaders match final layout shape
- Avoid layout shift: reserve space for async content
