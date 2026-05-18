> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# UX/UI Master Guide - Quick Reference

> Cheat sheet combining all guides. For details, see the linked guides.

---

## 1. Core Principles (7)

| #   | Principle                  | One-liner                                                            |
| --- | -------------------------- | -------------------------------------------------------------------- |
| 1   | **Proximity**              | Related items close together, unrelated items far apart              |
| 2   | **Progressive Disclosure** | Show only what's needed now, reveal more on demand                   |
| 3   | **Context Preservation**   | Never lose user's place - use modals/drawers not full navigations    |
| 4   | **Spatial Stability**      | Elements don't jump around - consistent positions across states      |
| 5   | **Visual Hierarchy**       | Size, color, weight guide the eye: Title > Subtitle > Body > Caption |
| 6   | **Reduce Cognitive Load**  | Max 7 items visible, group related actions, use progressive steps    |
| 7   | **Feedback Loops**         | Every action gets a response: loading, success, error states         |

See [Mindset Guide](./ux-ui-base-design-mind-set-guild.md)

---

## 2. Nielsen's 10 Heuristics (Applied)

| #   | Heuristic                   | How We Apply It                                                   |
| --- | --------------------------- | ----------------------------------------------------------------- |
| 1   | Visibility of system status | Loading spinners, progress bars, toast notifications              |
| 2   | Match real world            | Use business terms (Order, SKU), not dev terms (record, entity)   |
| 3   | User control & freedom      | Undo actions, close modals with X/ESC/backdrop, back navigation   |
| 4   | Consistency & standards     | Same button styles, same icon meanings, same color meanings       |
| 5   | Error prevention            | Disable invalid actions, confirm destructive ops, validate inline |
| 6   | Recognition over recall     | Show options in dropdowns, display current state, use breadcrumbs |
| 7   | Flexibility & efficiency    | Keyboard shortcuts, bulk actions, search/filter for power users   |
| 8   | Aesthetic minimal design    | No decorative elements, every element has a purpose               |
| 9   | Help users with errors      | Clear error messages with what happened + how to fix              |
| 10  | Help & documentation        | Tooltips on complex fields, empty states with guidance            |

---

## 3. Laws of UX

| Law                   | Meaning                                    | Action                                                   |
| --------------------- | ------------------------------------------ | -------------------------------------------------------- |
| **Fitts's Law**       | Bigger + closer = easier to click          | Primary buttons large, destructive buttons smaller       |
| **Hick's Law**        | More choices = slower decisions            | Max 5-7 menu items, use progressive disclosure           |
| **Jakob's Law**       | Users expect your site to work like others | Follow standard patterns (logo top-left, nav left, etc.) |
| **Miller's Law**      | ~7 items in working memory                 | Group/chunk information, use sections                    |
| **Doherty Threshold** | Response < 400ms feels instant             | Show loading states for anything > 400ms                 |

---

## 4. Color System

### Palette

| Role           | Hex       | Tailwind    |
| -------------- | --------- | ----------- |
| Primary        | `#3B82F6` | `blue-500`  |
| Success        | `#22C55E` | `green-500` |
| Warning        | `#F59E0B` | `amber-500` |
| Danger         | `#EF4444` | `red-500`   |
| Text Primary   | `#111827` | `gray-900`  |
| Text Secondary | `#6B7280` | `gray-500`  |
| Border         | `#E5E7EB` | `gray-200`  |
| Surface        | `#FFFFFF` | `white`     |
| Background     | `#F9FAFB` | `gray-50`   |
| Brand          | `#36C5D1` | custom      |

### Rules

- **60-30-10**: Backgrounds 60%, structure 30%, accent 10%
- WCAG contrast: 4.5:1 for text, 3:1 for large text/UI
- Never use color alone to convey meaning (add icon or text)
- Status colors: green=success, amber=warning, red=error, blue=info
- Brand teal for logo only, not for UI elements

See [Color Guide](./ux-ui-color-principles-guide.md)

---

## 5. Typography

| Level         | Size    | Weight         | Color      | Tailwind                  |
| ------------- | ------- | -------------- | ---------- | ------------------------- |
| Page Title    | 24-30px | Bold (700)     | `gray-900` | `text-2xl font-bold`      |
| Section Title | 18-20px | Semibold (600) | `gray-900` | `text-lg font-semibold`   |
| Card Title    | 16px    | Semibold (600) | `gray-900` | `text-base font-semibold` |
| Body          | 14px    | Normal (400)   | `gray-700` | `text-sm`                 |
| Caption/Label | 12px    | Medium (500)   | `gray-500` | `text-xs font-medium`     |

- Max line width: 65-75 characters
- Line height: 1.5 for body, 1.25 for headings
- Max 2-3 font sizes per page

---

## 6. Spacing

| Token           | Value | Use For                       |
| --------------- | ----- | ----------------------------- |
| `gap-1` / `p-1` | 4px   | Inline elements, icon padding |
| `gap-2` / `p-2` | 8px   | Between related items         |
| `gap-3` / `p-3` | 12px  | List items, form fields       |
| `gap-4` / `p-4` | 16px  | Card padding, section gaps    |
| `gap-6` / `p-6` | 24px  | Between sections              |
| `gap-8` / `p-8` | 32px  | Page-level spacing            |

- Use Tailwind spacing scale consistently
- 8px base grid (multiples of 2/4/8)
- Cards: `p-4` or `p-6` padding, `gap-4` between cards

---

## 7. Layout Patterns

### Sidebar + Content (Most Common)

```
[Sidebar 240px fixed] [Content flex-1 with max-width]
```

- Sidebar: fixed width, collapsible on mobile
- Content: `max-w-7xl mx-auto` for readability

### Full-Width Table

```
[Full-width container]
  [Filter bar]
  [Table with horizontal scroll]
  [Pagination]
```

### Form Page

```
[Content max-w-2xl mx-auto]
  [Form fields]
  [Action buttons right-aligned]
```

See [Pattern Guide](./ux-ui-design-pattern-guide.md)

---

## 8. Component Patterns

### Buttons

| Type      | When                        | Style                            |
| --------- | --------------------------- | -------------------------------- |
| Primary   | Main action (Save, Create)  | `bg-blue-500 text-white`         |
| Secondary | Alternative action (Cancel) | `border border-gray-300`         |
| Danger    | Destructive (Delete)        | `bg-red-500 text-white`          |
| Ghost     | Tertiary actions            | `text-blue-500 hover:bg-blue-50` |

**Rules**: One primary button per view. Destructive actions need confirmation dialog.

### Cards

- White background, `rounded-lg`, `border border-gray-200`
- Consistent padding: `p-4` or `p-6`
- Optional hover: `hover:shadow-md transition-shadow`

### Tables

- Header: `bg-gray-50 text-gray-500 text-xs font-medium uppercase`
- Rows: `border-b border-gray-200`, hover: `hover:bg-gray-50`
- Actions column: right-aligned, icon buttons or dropdown menu

### Forms

- Labels above inputs, required fields marked with \*
- Inline validation (show error below field immediately)
- Group related fields (address fields together, etc.)
- Actions: Primary right, Cancel left

### Modals/Dialogs

- Max width: `max-w-lg` for forms, `max-w-sm` for confirmations
- Close: X button, ESC key, backdrop click
- Destructive: "Are you sure?" with red confirm button

### Status Badges

| Status          | Colors                       |
| --------------- | ---------------------------- |
| Active/Success  | `bg-green-50 text-green-700` |
| Pending/Warning | `bg-amber-50 text-amber-700` |
| Error/Failed    | `bg-red-50 text-red-700`     |
| Info/Default    | `bg-blue-50 text-blue-700`   |
| Inactive/Draft  | `bg-gray-100 text-gray-600`  |

---

## 9. Dashboard Patterns

### KPI Cards (Top Row)

```tsx
<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
  <KPICard
    label='Total Orders'
    value='1,234'
    trend='+12%'
  />
</div>
```

### Charts

- Use `recharts` library
- Max 2-3 charts per section
- Always include: title, axis labels, legend, empty state
- Colors: use semantic palette (blue primary, then green, amber, red)

### Data Tables

- Default sort, search, filters above table
- Pagination below (10/25/50 per page)
- Row actions: edit, view, delete (in dropdown or icon buttons)

---

## 10. Responsive Strategy

**Desktop-first** (our approach):

| Breakpoint        | Width    | Prefix    |
| ----------------- | -------- | --------- |
| Desktop (default) | > 768px  | (none)    |
| Tablet            | <= 768px | `max-md:` |
| Mobile            | <= 640px | `max-sm:` |

**Key patterns:**

- Sidebar: visible on desktop, collapsible/hidden on mobile
- Tables: horizontal scroll on mobile, or convert to card list
- Grid columns: reduce (4 -> 2 -> 1)
- Modals: full-screen on mobile (`max-sm:w-full max-sm:h-full`)
- Font sizes: slightly smaller on mobile

---

## 11. Accessibility Checklist

- [ ] All images have `alt` text (decorative: `alt=""`)
- [ ] Color contrast >= 4.5:1 (text), >= 3:1 (UI elements)
- [ ] Interactive elements are keyboard accessible (Tab, Enter, Escape)
- [ ] Focus visible on all interactive elements (`focus-visible:ring-2`)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] No information conveyed by color alone
- [ ] Modals trap focus and restore on close
- [ ] Skip-to-content link for keyboard users

---

## 12. Anti-Patterns (Avoid These)

| Don't                                 | Do Instead                        |
| ------------------------------------- | --------------------------------- |
| Full page reload for actions          | Use modals/drawers, update inline |
| Color alone for status                | Add icon + label with color       |
| More than 1 primary button per view   | Choose one main action            |
| Nested modals                         | Use multi-step within one modal   |
| Layout shift on data load             | Use skeleton placeholders         |
| Custom scrollbars                     | Use native scroll behavior        |
| Tiny click targets (< 44px)           | Min 44x44px touch targets         |
| Alert/confirm dialogs for routine ops | Use toast notifications           |
| Disabling back button                 | Preserve browser navigation       |

---

## 13. Project Conventions

**Tech Stack**: Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui

**API Calls**: Always use `apiFetch<T>()` through `web/lib/api/*` and React Query hooks; never direct axios/fetch outside `web/lib/http/client.ts`

**File Structure**:

```
src/app/          - Pages (App Router)
src/components/   - Shared UI components
src/screens/      - Page-level UI containers
src/hooks/        - Custom hooks
src/contexts/     - React contexts
src/types/        - TypeScript types
theme/            - Design tokens
```

**Naming**: PascalCase components, useThing hooks, UPPER_SNAKE constants

**CSS**: Tailwind primary, CSS Modules for complex component styles. Desktop-first with `max-md:` and `max-sm:` breakpoints.

See [Rules Guide](./ux-ui-rule-guide.md) for all specific rules.
