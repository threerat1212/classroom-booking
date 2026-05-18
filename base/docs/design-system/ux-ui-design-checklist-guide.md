> For full workflow context, see docs/project-workflow.md.

# UX/UI Design Checklist

> Use before every PR. Items marked with a severity level.
> Critical = must fix before merge. Required = should fix. Recommended = nice to have.

---

## 1. Pre-Design Checklist

- [ ] Purpose of this page/component is clear
- [ ] User flow is mapped (where they come from, where they go next)
- [ ] Edge cases identified (empty state, error state, loading state)
- [ ] Mobile behavior considered

---

## 2. Color Checklist

- [ ] **Critical**: Text contrast >= 4.5:1 on background
- [ ] **Critical**: No color used as only indicator (always add icon/text)
- [ ] **Required**: Uses project palette only (blue-500, green-500, amber-500, red-500, grays)
- [ ] **Required**: 60-30-10 ratio maintained
- [ ] **Required**: Status colors match conventions (green=success, red=error, amber=warning)
- [ ] **Recommended**: Checked with color-blind simulation

---

## 3. Typography Checklist

- [ ] **Critical**: Clear visual hierarchy (title > subtitle > body > caption)
- [ ] **Required**: Max 2-3 font sizes per view
- [ ] **Required**: Line height >= 1.5 for body text
- [ ] **Required**: Max line width 65-75 characters
- [ ] **Recommended**: Consistent heading levels (no skipping h2 to h4)

---

## 4. Layout & Spacing Checklist

- [ ] **Critical**: Consistent spacing using Tailwind scale (gap-2, gap-4, gap-6)
- [ ] **Critical**: No layout shifts when content loads
- [ ] **Required**: Content max-width for readability
- [ ] **Required**: Proper alignment (left-align text, right-align numbers)
- [ ] **Required**: Logical grouping (related items together, space between groups)
- [ ] **Recommended**: 8px base grid alignment

---

## 5. Component Checklist

- [ ] **Critical**: Only 1 primary button per view
- [ ] **Critical**: All interactive elements have hover + focus states
- [ ] **Required**: Consistent button sizing within a view
- [ ] **Required**: Cards have consistent padding and border style
- [ ] **Required**: Tables have header, hover, empty state
- [ ] **Recommended**: Icons are consistent style (all outline or all filled)

---

## 6. Interaction Checklist

- [ ] **Critical**: Every action has feedback (loading, success, error)
- [ ] **Critical**: Destructive actions require confirmation
- [ ] **Required**: Form validation shows inline errors
- [ ] **Required**: Loading states for all async content
- [ ] **Required**: Empty states for all lists/tables
- [ ] **Recommended**: Keyboard shortcuts for power users

---

## 7. Accessibility Checklist

- [ ] **Critical**: All images have alt text
- [ ] **Critical**: Focus visible on all interactive elements
- [ ] **Critical**: Forms have associated labels
- [ ] **Required**: Skip-to-content link
- [ ] **Required**: Modal traps focus properly
- [ ] **Required**: ARIA labels on icon-only buttons
- [ ] **Recommended**: Tested with keyboard-only navigation

---

## 8. Responsive Checklist

- [ ] **Critical**: Content readable on 320px width
- [ ] **Critical**: No horizontal scroll on mobile (unless table)
- [ ] **Required**: Touch targets >= 44x44px
- [ ] **Required**: Sidebar collapses on mobile
- [ ] **Required**: Grid reduces columns (4 -> 2 -> 1)
- [ ] **Recommended**: Tested on actual device (not just resize)

---

## 9. Performance Checklist

- [ ] **Required**: Using `next/image` for all images
- [ ] **Required**: No unnecessary re-renders (check React DevTools)
- [ ] **Required**: Lists > 50 items are virtualized
- [ ] **Recommended**: Skeleton loaders match final layout
- [ ] **Recommended**: Lazy loading for below-fold content

---

## 10. Code Quality Checklist

- [ ] **Required**: Using Tailwind + CSS Modules (no inline style objects)
- [ ] **Required**: Using `apiFetch<T>()` through typed API modules and React Query hooks (not direct axios/fetch outside `web/lib/http/client.ts`)
- [ ] **Required**: TypeScript strict - no `any`, no `!` assertions
- [ ] **Required**: Component is a named arrow function export
- [ ] **Recommended**: Props destructured with TypeScript type
- [ ] **Recommended**: File follows project naming conventions

---

## 11. Visual QA / Screenshot Analysis

- [ ] **Critical**: No content clipped or cut off at container edges
- [ ] **Critical**: No elements compressed to unnatural heights (e.g., banner at 44px instead of 100px)
- [ ] **Critical**: No empty wrapper divs showing as blank boxes
- [ ] **Critical**: Page containers use `min-h-0 overflow-y-auto`, NOT `max-h-screen overflow-hidden`
- [ ] **Required**: Grid items properly distributed (no orphaned single items in wide rows)
- [ ] **Required**: Progress bars / indicators visible (not 0-width invisible)
- [ ] **Required**: Right-side elements (dates, badges) not pushed off-screen
- [ ] **Required**: Fixed-content elements use `flex-shrink-0 whitespace-nowrap`
- [ ] **Recommended**: All 4 edges of every container checked for boundary clipping

See [Visual QA Screenshot Guide](./visual-qa-screenshot-guide.md) for full protocol.

---

## 12. Pre-Merge Final Checklist

- [ ] All Critical items above are passing
- [ ] Tested happy path + error path + empty state
- [ ] Responsive: desktop + tablet + mobile
- [ ] No console errors or warnings
- [ ] Accessibility: keyboard navigation works
- [ ] Loading states present for all async operations
- [ ] Screenshot taken and analyzed with 4-pass visual scan

---

## Quick Pass/Fail

**Must pass ALL of these before merge:**

1. Text is readable (contrast)
2. Color is not only indicator
3. One primary button per view
4. Every action has feedback
5. Destructive actions need confirmation
6. Loading states exist
7. Empty states exist
8. Focus is visible
9. Content works on mobile
10. Uses `apiFetch<T>()` through typed API modules for API calls
