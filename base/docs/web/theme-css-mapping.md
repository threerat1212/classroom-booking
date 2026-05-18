> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Theme CSS Variable Mapping

## How Theme Data Becomes CSS

```
ThemeConfig (app-config or API)
  → generateThemeCSS() in lib/theme.ts
    → <style dangerouslySetInnerHTML> in layout.tsx
      → CSS custom properties on :root
        → Tailwind v4 @theme inline mapping in globals.css
          → Utility classes: bg-primary, text-foreground, etc.
```

## Color Variables

| ThemeConfig Key                  | CSS Variable           | Tailwind Class               |
| -------------------------------- | ---------------------- | ---------------------------- |
| `colors.light.background`        | `--background`         | `bg-background`              |
| `colors.light.foreground`        | `--foreground`         | `text-foreground`            |
| `colors.light.surface`           | `--surface`            | `bg-surface`                 |
| `colors.light.primary`           | `--primary`            | `bg-primary`, `text-primary` |
| `colors.light.primaryForeground` | `--primary-foreground` | `text-primary-foreground`    |
| `colors.light.primaryLight`      | `--primary-light`      | `bg-primary-light`           |
| `colors.light.primaryDark`       | `--primary-dark`       | `bg-primary-dark`            |
| `colors.light.accent`            | `--accent`             | `bg-accent`                  |
| `colors.light.border`            | `--border`             | `border-border`              |
| `colors.light.textSecondary`     | `--text-secondary`     | `text-text-secondary`        |
| `colors.light.textTertiary`      | `--text-tertiary`      | `text-text-tertiary`         |
| `colors.light.success`           | `--success`            | `text-success`               |
| `colors.light.warning`           | `--warning`            | `text-warning`               |
| `colors.light.danger`            | `--danger`             | `text-danger`                |

Dark mode colors are auto-applied via `@media (prefers-color-scheme: dark)` block.

## Gradient Variables

| ThemeConfig Key              | CSS Variable           |
| ---------------------------- | ---------------------- |
| `gradients.section.from`     | `--gradient-from`      |
| `gradients.section.via`      | `--gradient-via`       |
| `gradients.section.to`       | `--gradient-to`        |
| `gradients.sectionDark.from` | `--gradient-dark-from` |
| `gradients.sectionDark.via`  | `--gradient-dark-via`  |
| `gradients.sectionDark.to`   | `--gradient-dark-to`   |

## Typography & Animation Variables

| ThemeConfig Key                     | CSS Variable         |
| ----------------------------------- | -------------------- |
| `typography.fontFamily.sans`        | `--font-sans`        |
| `typography.fontFamily.mono`        | `--font-mono`        |
| `typography.headings.fontWeight`    | `--heading-weight`   |
| `typography.headings.letterSpacing` | `--heading-tracking` |
| `typography.body.lineHeight`        | `--body-line-height` |
| `animations.durationFast`           | `--duration-fast`    |
| `animations.durationNormal`         | `--duration-normal`  |
| `animations.durationSlow`           | `--duration-slow`    |
| `animations.easing`                 | `--easing`           |

## Security

All color values pass through `sanitizeColorValue()` which validates hex colors and rejects unsafe CSS values (falls back to `#000000`).
