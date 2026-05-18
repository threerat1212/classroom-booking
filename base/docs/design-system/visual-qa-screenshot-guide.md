> For full workflow context, see docs/project-workflow.md.

# Visual QA & Screenshot Bug Detection Guide

> Use this guide when analyzing screenshots of the application to find visual bugs.
> Every screenshot MUST be analyzed systematically — not just glanced at.

---

## Golden Rule

> **"If a human user would see it as a bug, it IS a bug."**

Do not rationalize layout issues. If text is clipped, elements are compressed, or content is invisible — that's a bug, even if the code "technically works."

---

## 1. Systematic Screenshot Scan Protocol

When you receive or take a screenshot, scan in this order:

### Pass 1: Content Visibility

- [ ] Can ALL text be fully read? (no clipping, no truncation)
- [ ] Do all elements have their natural height? (a card is not squished to 44px)
- [ ] Are images/icons displayed? (no broken placeholders)
- [ ] Are progress bars visible? (not 0-width invisible bars)

### Pass 2: Layout Integrity

- [ ] Are grid/flex items properly distributed across their row?
- [ ] No orphaned items (1 item alone in a row of 5)?
- [ ] No unexpected empty space (blank cards, empty wrappers)?
- [ ] Are sections aligned with their neighbors?

### Pass 3: Spacing & Sizing

- [ ] Consistent padding within cards/sections?
- [ ] No overlapping elements?
- [ ] No giant unexplained gaps?
- [ ] Right-side content not pushed off-screen?

### Pass 4: Data & States

- [ ] Do stat cards show meaningful values?
- [ ] Are status badges correct colors (green=active, red=error)?
- [ ] Do charts display data or gracefully handle no-data?
- [ ] Are tables populated (or show proper empty state)?

---

## 2. Common Layout Bugs in This Project

### The Flex Compression Problem

This project uses a deep flex layout chain with `overflow-hidden` at every level:

```
.mainWrapper    → h-dvh flex-col overflow-hidden
  .layoutBody   → flex-1 overflow-hidden
    .mainContent → flex-1 flex-col overflow-hidden
      .content   → flex-1 flex-col overflow-hidden
        [PAGE]   → children must NOT add more height constraints
```

**Rule:** Page containers should use `flex-1 flex-col min-h-0 overflow-y-auto` — NEVER `max-h-screen` or `overflow-hidden`. The parent layout already constrains height.

### Empty Container Wrappers

When child components conditionally return `null`, their wrapper div still renders with padding/border, showing as an empty box. **Fix:** render children directly without wrapper, or conditionally render the wrapper.

### Grid Column Mismatch

When the number of items doesn't match `grid-template-columns`, items bunch up on one side. **Fix:** Use array-of-arrays pattern (`StatRow[]`) to explicitly control row composition.

### Invisible Zero-Value Elements

Progress bars at 0% width, badges with empty text, dividers with 0 height — all invisible. **Fix:** Use minimum visible values (e.g., 5% width for zero-stock bars).

---

## 3. Dimension Benchmarks

Know what things SHOULD look like:

| Element         | Expected Height | If Less Than → Bug  |
| --------------- | --------------- | ------------------- |
| Welcome banner  | 80-120px        | < 60px = compressed |
| Stat card       | 70-100px        | < 50px = squished   |
| Table row       | 48-64px         | < 40px = cramped    |
| Navigation card | 80-120px        | < 60px = compressed |
| Progress bar    | 8-12px          | 0px = invisible     |
| Alert banner    | 40-60px         | < 30px = clipped    |

---

## 4. Bias Awareness

When you just wrote the code, you're biased to see the screenshot as correct. Counter this by:

1. **Fresh eyes:** Look at the screenshot as if you've NEVER seen the code
2. **Edge scan:** Check all 4 edges of every container — clipping happens at boundaries
3. **User test:** Ask "Would a customer report this?"
4. **Dimension check:** If something looks small, it probably IS too small
5. **Compare:** Look at other pages in the app — does this one look consistent?

---

## 5. Screenshot Verification Checklist (Post-Change)

After making any UI change:

```
□ Take full-page screenshot
□ Run the 4-pass scan protocol above
□ Check the specific element you changed
□ Check elements NEAR what you changed (your change may have shifted neighbors)
□ Scroll and check below-the-fold content
□ If any issue found → fix → re-screenshot → re-scan
```

---

## 6. Table Column Width & `table-fixed` Visual Bugs

### How `table-fixed` Works

The table component uses `table-fixed` CSS (`table.module.css`). With `table-fixed`:

- Columns with explicit `width` values get those widths
- If **total column widths < container width** (~1100px), the browser **proportionally stretches ALL columns** to fill the container
- If **total column widths > container width**, columns get **compressed** and text truncates

### The Stretching Problem

If your columns total only 700px in a 1100px container, each column gets stretched by ~1.57x. A 250px column balloons to ~393px, making content float in the center of an oversized cell.

### The Fix: One Flexible Column

Every table should have **one primary content column WITHOUT a fixed `width`**. This column absorbs remaining space naturally:

```tsx
// ✅ Good: primary content column is flexible
{ key: 'name', label: 'ชื่อ' },           // no width → flexible
{ key: 'type', label: 'ประเภท', width: 140 },
{ key: 'status', label: 'สถานะ', width: 120 },
{ key: 'actions', label: '', width: 52 },

// ❌ Bad: all columns have fixed widths, total < container
{ key: 'name', label: 'ชื่อ', width: 250 },
{ key: 'type', label: 'ประเภท', width: 120 },
{ key: 'status', label: 'สถานะ', width: 100 },
```

### Width Budget Rule

All **fixed-width** columns should total ≤ ~1100px (content area width). Include:

- `48px` for the expand chevron column (if table has expandable rows)
- `52px` for the actions (kebab menu) column

### Button Link Centering Bug

The `Button` component has `justify-center` as a default (from `.button` base class). When a `variant='link'` Button is inside a `flex-col` parent, it stretches to full width and centers text visually.

**Fix:** Add `items-start` to the parent `flex-col` div AND `max-w-full` to the Button:

```tsx
// ✅ Correct
<div className='flex min-w-0 flex-col items-start'>
  <Button
    variant='link'
    className='h-auto max-w-full justify-start p-0'
  >
    <span className='truncate'>{name}</span>
  </Button>
  <span>{code}</span>
</div>
```

---

## 7. Quick Reference: CSS Anti-Patterns

```scss
// ❌ NEVER inside page containers (parent already constrains)
max-h-screen
overflow-hidden (on scrollable containers)
h-screen (nested inside flex layout)

// ✅ ALWAYS for page scrollable containers
min-h-0        // allows flex shrink
overflow-y-auto // enables scrolling
flex-1         // fills available space
flex-col       // vertical layout

// ✅ ALWAYS for fixed-content elements (dates, badges)
flex-shrink-0  // prevents compression
whitespace-nowrap // prevents wrapping
```
