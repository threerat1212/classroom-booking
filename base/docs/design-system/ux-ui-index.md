> For full workflow context, see docs/project-workflow.md.

# UX/UI Design System

> Pick the guide you need. Read in order if new to the project.
>
> **Live component browser:** [http://localhost:3000/design-system](http://localhost:3000/design-system)

## Guides

| Guide                                                    | When to Use                                                |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| [Component Catalog](./component-catalog.md)              | All reusable components — import paths, props, examples    |
| [Component Usage Guide](./component-usage-guide.md)      | Quick decision tree — which component to use when          |
| [Hooks Catalog](./hooks-catalog.md)                      | All reusable hooks — patterns, parameters, return values   |
| [DRY Audit Report](../DRY-AUDIT-REPORT.md)               | Codebase consistency audit — violations, exceptions, fixes |
| [DRY Audit Exceptions](./dry-audit-exceptions.md)        | Acceptable exceptions & migration patterns                 |
| [Mindset](./ux-ui-base-design-mind-set-guild.md)         | Core principles — read first                               |
| [Color](./ux-ui-color-principles-guide.md)               | Palette, contrast, accessibility                           |
| [Rules](./ux-ui-rule-guide.md)                           | Must-follow rules for every UI change                      |
| [Patterns](./ux-ui-design-pattern-guide.md)              | Copy-paste Tailwind patterns                               |
| [Best Practices](./ux-ui-design-best-practices-guild.md) | Layout, forms, tables, navigation                          |
| [Process](./ux-ui-design-process-guild.md)               | 6-phase design workflow                                    |
| [Checklist](./ux-ui-design-checklist-guide.md)           | Pre-merge evaluation                                       |
| [Resources](./ux-ui-design-resources-guild.md)           | External references and tools                              |
| [Master Guide](./ux-ui-master-guide.md)                  | Quick-reference cheat sheet                                |

## Quick Start

- **New to project?** → Mindset → Color → Rules → Checklist
- **Building a page?** → Patterns → Rules → Checklist
- **Redesigning?** → Process → Patterns → Checklist

## Color Palette (Quick Reference)

| Role       | Tailwind                             | Usage                    |
| ---------- | ------------------------------------ | ------------------------ |
| Primary    | `blue-500`                           | CTAs, active, links      |
| Success    | `green-500`                          | Positive status          |
| Warning    | `amber-500`                          | Caution, pending         |
| Danger     | `red-500`                            | Errors, destructive      |
| Text       | `gray-900` / `gray-700` / `gray-500` | Primary / body / caption |
| Border     | `gray-200`                           | Cards, dividers          |
| Surface    | `white`                              | Cards, modals            |
| Background | `gray-50`                            | Page backgrounds         |

**Rule**: White backgrounds 60% → Gray structure 30% → Blue accent 10%
