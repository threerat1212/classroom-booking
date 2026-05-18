> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Theme & Typography Configuration Guide

## Research Summary

Based on analysis of 20+ design systems and theme approaches (2020–2026):

### Sources Analyzed

1. **Tailwind CSS v4** — `@theme inline` CSS custom property token registration
2. **shadcn/ui** — CSS variables approach with `:root` and `.dark` class toggling
3. **Radix Themes** — CSS variable-driven theming with semantic tokens
4. **Chakra UI v3** — Token-based theme with semantic color tokens
5. **Material UI (MUI) v6** — Theme object with palette, typography, spacing
6. **Mantine v7** — CSS variables generated from theme object
7. **Open Props** — CSS custom properties framework with design tokens
8. **Ant Design v5** — Design token system (seed → map → alias → component)
9. **Panda CSS** — Token-based styling with semantic tokens
10. **Carbon Design System (IBM)** — Three-tier design token architecture
11. **Spectrum (Adobe)** — Global → alias → component token layers
12. **Lightning Design System (Salesforce)** — Design token specification
13. **Primer (GitHub)** — Primitive + semantic + component token layers
14. **Atlassian Design Tokens** — Three-tier token system for theming
15. **W3C Design Tokens Community Group** — Standard format specification
16. **Style Dictionary (Amazon)** — Design token management and transformation
17. **Theme UI** — Specification-compliant theme objects
18. **Vanilla Extract** — Theme contracts using CSS variables
19. **Next.js Official Docs** — App Router metadata and font optimization
20. **Google Material Design 3** — Dynamic color and typography system

### Key Best Practices

1. **CSS Custom Properties**: All modern systems use CSS variables for runtime theming
2. **Semantic Tokens**: Map primitive values to semantic names (e.g., `primary` instead of `blue-600`)
3. **Light/Dark Mode**: Separate color definitions per color scheme
4. **JSON-First Config**: Define tokens in JSON, transform to CSS — enables DB-driven theming
5. **Typography Scale**: Consistent type scale with font-size + line-height pairs
6. **Font Loading**: Use `next/font` for self-hosted fonts, `display: 'swap'` or `'optional'`
7. **Gradient Tokens**: Gradient colors should be derived from primary/brand colors
8. **No Hardcoded Colors**: All color values should reference CSS variables, not raw hex/rgb

### Architecture Decision

**Approach**: JSON → CSS Custom Properties → Tailwind CSS v4 Tokens

- `app/app-config/theme.json` defines all theme values
- `lib/theme.ts` generates CSS from JSON
- Root layout injects `<style>` with CSS custom properties
- `globals.css` `@theme inline` maps CSS variables to Tailwind tokens
- Components use Tailwind utility classes (`bg-primary`, `text-foreground`, etc.)

This approach:
- Zero client-side JavaScript for theming
- Server-rendered CSS (best for performance and consistency)
- Full light/dark mode support via `prefers-color-scheme`
- Easy migration to database-driven config later
- Full Tailwind CSS v4 compatibility

### Color Token Structure

| Token | Purpose | Light Default | Dark Default |
|-------|---------|---------------|--------------|
| `background` | Page background | `#f9fafb` | `#0a0a0a` |
| `foreground` | Primary text | `#111827` | `#ededed` |
| `surface` | Card/panel background | `#ffffff` | `#171717` |
| `primary` | Brand/accent color | `#3b82f6` | `#60a5fa` |
| `primaryForeground` | Text on primary bg | `#ffffff` | `#0a0a0a` |
| `primaryLight` | Lighter primary variant | `#93c5fd` | `#93c5fd` |
| `primaryDark` | Darker primary variant | `#1d4ed8` | `#3b82f6` |
| `border` | Borders/dividers | `#e5e7eb` | `#2e2e2e` |
| `textSecondary` | Secondary text | `#6b7280` | `#a1a1aa` |
| `textTertiary` | Tertiary/muted text | `#9ca3af` | `#8b8b94` |
| `success` | Success states | `#22c55e` | `#22c55e` |
| `warning` | Warning states | `#f59e0b` | `#f59e0b` |
| `danger` | Error/danger states | `#ef4444` | `#ef4444` |
| `accent` | Secondary brand color | `#8b5cf6` | `#a78bfa` |

### Typography Tokens

| Token | Purpose | Default |
|-------|---------|---------|
| `fontSans` | Body font family | Geist Sans + system fallbacks |
| `fontMono` | Code font family | System monospace stack |
| `headingWeight` | Heading font-weight | `700` |
| `headingTracking` | Heading letter-spacing | `-0.025em` |
| `bodyLineHeight` | Body text line-height | `1.625` |

### Additional Tokens

| Category | Tokens |
|----------|--------|
| Border Radius | `radiusSm`, `radiusMd`, `radiusLg`, `radiusXl`, `radius2xl`, `radiusFull` |
| Gradients | `gradientFrom`, `gradientVia`, `gradientTo` (section backgrounds) |
| Animations | `durationFast`, `durationNormal`, `durationSlow`, `easing` |
| Layout | `containerMaxWidth`, `contentMaxWidth` |
| Brand | `brandInitials` (for icon/OG generation) |
