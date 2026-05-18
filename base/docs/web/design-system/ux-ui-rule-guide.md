> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# UX/UI Rules Guide

> Non-negotiable rules. Severity: Critical (must fix) | Required (should fix) | Recommended (nice to have)

---

## R1. Color Rules

| ID   | Rule                                                                      | Severity    |
| ---- | ------------------------------------------------------------------------- | ----------- |
| R1.1 | Use project palette ONLY (blue-500, green-500, amber-500, red-500, grays) | Critical    |
| R1.2 | Text contrast >= 4.5:1 on background                                      | Critical    |
| R1.3 | Never use color as only indicator - add icon or text                      | Critical    |
| R1.4 | 60-30-10 ratio (backgrounds 60%, structure 30%, accent 10%)               | Required    |
| R1.5 | Status: green=success, amber=warning, red=error, blue=info                | Required    |
| R1.6 | Brand teal for logo only, not UI elements                                 | Required    |
| R1.7 | Use `gray-900` for text, never pure black `#000`                          | Recommended |

---

## R2. Typography Rules

| ID   | Rule                                                                                             | Severity    |
| ---- | ------------------------------------------------------------------------------------------------ | ----------- |
| R2.1 | Clear size hierarchy: title (24px) > section (18px) > card (16px) > body (14px) > caption (12px) | Critical    |
| R2.2 | Max 2-3 font sizes per view                                                                      | Required    |
| R2.3 | Line height >= 1.5 for body text                                                                 | Required    |
| R2.4 | Max line width 65-75 characters                                                                  | Recommended |

---

## R3. Spacing Rules

| ID   | Rule                                                        | Severity |
| ---- | ----------------------------------------------------------- | -------- |
| R3.1 | Use Tailwind spacing scale only (gap-2, gap-4, gap-6, etc.) | Critical |
| R3.2 | 8px base grid alignment                                     | Required |
| R3.3 | Consistent card padding: `p-4` or `p-6`                     | Required |

---

## R4. Layout Rules

| ID   | Rule                                                 | Severity    |
| ---- | ---------------------------------------------------- | ----------- |
| R4.1 | No layout shifts when content loads (use skeletons)  | Critical    |
| R4.2 | Content has max-width for readability                | Required    |
| R4.3 | Left-align text, right-align numbers in tables       | Required    |
| R4.4 | Related items grouped together, space between groups | Required    |
| R4.5 | Page structure: Header -> Content -> (Pagination)    | Recommended |

---

## R5. Component Rules

| ID   | Rule                                                                                | Severity    |
| ---- | ----------------------------------------------------------------------------------- | ----------- |
| R5.1 | Only 1 primary button per view                                                      | Critical    |
| R5.2 | All interactive elements have hover + focus states                                  | Critical    |
| R5.3 | Buttons: Primary (`blue-500`), Secondary (border), Danger (`red-500`), Ghost (text) | Required    |
| R5.4 | Tables: header row, hover state, empty state                                        | Required    |
| R5.5 | Cards: `rounded-lg border border-gray-200 bg-white`                                 | Required    |
| R5.6 | Consistent icon style (all outline OR all filled, not mixed)                        | Recommended |

---

## R6. Interaction Rules

| ID   | Rule                                                          | Severity |
| ---- | ------------------------------------------------------------- | -------- |
| R6.1 | Every action has feedback (loading, success, error)           | Critical |
| R6.2 | Destructive actions require confirmation dialog               | Critical |
| R6.3 | Form validation: inline errors below fields, validate on blur | Required |
| R6.4 | Loading: < 300ms nothing, 300ms-1s spinner, > 1s skeleton     | Required |

---

## R7. Accessibility Rules

| ID   | Rule                                                              | Severity |
| ---- | ----------------------------------------------------------------- | -------- |
| R7.1 | All images have `alt` text                                        | Critical |
| R7.2 | Focus visible: `focus-visible:ring-2 focus-visible:ring-blue-500` | Critical |
| R7.3 | Form inputs have associated labels                                | Critical |
| R7.4 | Icon-only buttons have `aria-label`                               | Required |
| R7.5 | Modals trap focus and restore on close                            | Required |

---

## R8. Code Rules

| ID   | Rule                                                                 | Severity |
| ---- | -------------------------------------------------------------------- | -------- |
| R8.1 | API calls: always `apiFetch<T>()` through typed API modules; never direct axios/fetch outside `web/lib/http/client.ts` | Critical |
| R8.2 | TypeScript strict: no `any`, no `!` assertions                       | Critical |
| R8.3 | Styling: Tailwind CSS primary, CSS Modules for complex scoped styles | Required |
| R8.4 | Components: named arrow function exports                             | Required |
| R8.5 | Use `next/image` for all images                                      | Required |

---

## R9. Status/Semantic Rules

| ID   | Rule                                                     | Severity |
| ---- | -------------------------------------------------------- | -------- |
| R9.1 | Status badges: colored background + matching text + icon | Required |
| R9.2 | Success: `bg-green-50 text-green-700`                    | Required |
| R9.3 | Warning: `bg-amber-50 text-amber-700`                    | Required |
| R9.4 | Error: `bg-red-50 text-red-700`                          | Required |

---

## R10. Responsive Rules

| ID    | Rule                                                               | Severity |
| ----- | ------------------------------------------------------------------ | -------- |
| R10.1 | Desktop-first: default -> `max-md:` (tablet) -> `max-sm:` (mobile) | Critical |
| R10.2 | Content readable at 320px width                                    | Critical |
| R10.3 | Touch targets >= 44x44px                                           | Required |
| R10.4 | Sidebar collapses on mobile                                        | Required |
| R10.5 | Grid reduces: 4 cols -> 2 cols -> 1 col                            | Required |

---

## R11. Design System Component Rules

| ID    | Rule                                                                               | Severity |
| ----- | ---------------------------------------------------------------------------------- | -------- |
| R11.1 | Use `Button` from `@/components/ui/button` — no raw `<button>` in app code         | Critical |
| R11.2 | Use `Table` primitives from `@/components/table` — no raw `<table>` in app code    | Critical |
| R11.3 | Use `TableBadge` from `@/components/ui/table-badge` for status in tables/lists     | Critical |
| R11.4 | Use `Dialog` or `ModalLayout` for modals — no `fixed inset-0 bg-black/60` overlays | Critical |
| R11.5 | Use `useSnackbar` from `@/hooks/useSnackbar` for notifications — not `useToast`    | Critical |
| R11.6 | Use `NumberInput` from `@/components/ui/number-input` — no `<input type="number">` | Required |
| R11.7 | Use `StatusBadge` from `@/components/ui/StatusBadge` for standalone status display | Required |
| R11.8 | Centralize status configs in `@/lib/` — no duplicate STATUS_COLORS maps            | Required |

### R11 Exceptions

- UI primitive internals (SearchableSelect, multi-select, date-picker) may use raw elements
- Print/invoice templates may use raw `<table>` for PDF formatting
- Drag-and-drop handles may use raw `<button>` for accessibility
- Image lightbox overlays may use custom positioning for performance
