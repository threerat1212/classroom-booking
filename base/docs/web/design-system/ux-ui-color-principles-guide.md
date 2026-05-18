> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Color Principles Guide

> All color decisions for the project. One source of truth.

---

## 1. Project Color Palette

### Primary Palette

| Role              | Hex       | Tailwind    | Usage                                   |
| ----------------- | --------- | ----------- | --------------------------------------- |
| **Primary**       | `#3B82F6` | `blue-500`  | CTAs, active states, links, focus rings |
| **Primary Hover** | `#2563EB` | `blue-600`  | Hover states for primary                |
| **Primary Light** | `#EFF6FF` | `blue-50`   | Selected row backgrounds, info badges   |
| **Success**       | `#22C55E` | `green-500` | Positive status, completion             |
| **Success Light** | `#F0FDF4` | `green-50`  | Success badge backgrounds               |
| **Warning**       | `#F59E0B` | `amber-500` | Caution, pending states                 |
| **Warning Light** | `#FFFBEB` | `amber-50`  | Warning badge backgrounds               |
| **Danger**        | `#EF4444` | `red-500`   | Errors, destructive actions             |
| **Danger Light**  | `#FEF2F2` | `red-50`    | Error badge backgrounds                 |

### Neutral Palette

| Role           | Hex       | Tailwind   | Usage                             |
| -------------- | --------- | ---------- | --------------------------------- |
| Text Primary   | `#111827` | `gray-900` | Headings, primary text            |
| Text Secondary | `#374151` | `gray-700` | Body text                         |
| Text Tertiary  | `#6B7280` | `gray-500` | Captions, labels, placeholders    |
| Border         | `#E5E7EB` | `gray-200` | Card borders, dividers            |
| Background Alt | `#F3F4F6` | `gray-100` | Table headers, subtle backgrounds |
| Background     | `#F9FAFB` | `gray-50`  | Page backgrounds                  |
| Surface        | `#FFFFFF` | `white`    | Cards, modals, content areas      |

### Special

| Role  | Hex       | Usage                  |
| ----- | --------- | ---------------------- |
| Brand | `#36C5D1` | Logo and branding ONLY |

---

## 2. The 60-30-10 Rule

```
60% - Dominant (White/gray-50 backgrounds)
30% - Secondary (Gray borders, text, structure)
10% - Accent (Blue primary + status colors)
```

This keeps the interface clean and professional. The accent color draws attention to what matters.

---

## 3. Status Colors

Always pair color with an icon or label. Never use color alone.

| Status        | Background    | Text             | Icon           |
| ------------- | ------------- | ---------------- | -------------- |
| Success       | `bg-green-50` | `text-green-700` | check-circle   |
| Warning       | `bg-amber-50` | `text-amber-700` | alert-triangle |
| Error         | `bg-red-50`   | `text-red-700`   | x-circle       |
| Info          | `bg-blue-50`  | `text-blue-700`  | info           |
| Neutral/Draft | `bg-gray-100` | `text-gray-600`  | minus-circle   |

### Badge Pattern

```tsx
<span className='inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'>
  <CheckCircle className='h-3 w-3' />
  Active
</span>
```

---

## 4. Accessibility (WCAG)

### Contrast Requirements

- Normal text (< 18px): **4.5:1** minimum contrast ratio
- Large text (>= 18px bold or >= 24px): **3:1** minimum
- UI components (borders, icons): **3:1** minimum

### Safe Text Colors on White

| Color                | On White | Passes?         |
| -------------------- | -------- | --------------- |
| `gray-900` (#111827) | 15.4:1   | Yes             |
| `gray-700` (#374151) | 9.6:1    | Yes             |
| `gray-500` (#6B7280) | 5.0:1    | Yes             |
| `gray-400` (#9CA3AF) | 3.0:1    | Large text only |
| `blue-500` (#3B82F6) | 3.1:1    | Large text only |
| `blue-700` (#1D4ED8) | 6.9:1    | Yes             |

### Tips

- Use `gray-500` as minimum for readable text
- For blue text on white, prefer `blue-700` for small text
- For blue buttons with white text, `blue-500` passes (white on blue = 4.6:1)
- Test with browser dev tools or WebAIM contrast checker

---

## 5. Color for Interaction States

| State          | How to Apply                                  |
| -------------- | --------------------------------------------- |
| Default        | Base color                                    |
| Hover          | One shade darker (`blue-500` -> `blue-600`)   |
| Active/Pressed | Two shades darker (`blue-500` -> `blue-700`)  |
| Focus          | `ring-2 ring-blue-500 ring-offset-2`          |
| Disabled       | `opacity-50 cursor-not-allowed`               |
| Selected       | Light background (`blue-50`) + primary border |

---

## 6. Background Usage

| Area            | Color                | Why                                |
| --------------- | -------------------- | ---------------------------------- |
| Page background | `gray-50`            | Subtle contrast with cards         |
| Card/Modal      | `white`              | Clean surface for content          |
| Table header    | `gray-50`            | Distinguish header from rows       |
| Sidebar         | `white` or `gray-50` | Consistent with page               |
| Hover row       | `gray-50`            | Subtle interaction feedback        |
| Selected row    | `blue-50`            | Clear selection with primary color |

---

## 7. Color Don'ts

| Don't                                 | Why                                 |
| ------------------------------------- | ----------------------------------- |
| Use brand teal (`#36C5D1`) for UI     | Reserved for logo/branding only     |
| Use red for non-error things          | Users assume red = problem          |
| Use green for non-success things      | Users assume green = good/done      |
| Use color as only indicator           | Color-blind users can't distinguish |
| Mix different blue shades for primary | Stick to `blue-500` family          |
| Use pure black (`#000000`) for text   | Too harsh. Use `gray-900`           |
| Put light text on light backgrounds   | Check contrast ratio first          |

---

## 8. Token Architecture (3 Layers)

```
Layer 1 - Primitive:    blue-500, gray-200, red-500
Layer 2 - Semantic:     primary, border, danger
Layer 3 - Component:    button-primary-bg, card-border
```

We use Tailwind classes directly (Layer 1) with semantic meaning documented here (Layer 2).
For complex theming, see `web/theme/` directory for token files.
