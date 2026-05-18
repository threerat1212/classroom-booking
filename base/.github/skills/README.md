# Skill Catalog

Use this file as the first lookup table before acting.

For full workflow context, see `docs/project-workflow.md`.

For the shortest version, use `.github/skills/QUICKSTART.md`.

## Non-Negotiable Rule

Every AI task must start by selecting a skill from this catalog.

- No direct coding, planning, review, or testing without a selected skill.
- If unsure, pick `lawyer-management-system` first, then add one narrower skill only when needed.
- If no skill fits, state that clearly and continue with repository instructions.

## 10-Second Skill Picker

If unsure, match the request to one row and start with that skill.

| If the task is about... | Start with | Add only if needed |
| --- | --- | --- |
| Repo direction, docs alignment, management-system decisions | `lawyer-management-system` | `planner` or `reviewer` |
| Reading code and planning work | `planner` | `lawyer-management-system` |
| Backend + frontend + shared types | `fullstack` | `lawyer-management-system` |
| SQL queries or sqlc generation | `generate-db-layer` | `common-api` |
| Database migrations | `generate-migration` | `common-api` |
| Swagger/OpenAPI generation | `generate-api-spec` | `common-api` |
| Frontend API contracts or Orval | `generate-frontend-types` | `typescript-best-practices` |
| Gin handler implementation | `implement-handler` | `common-api` |
| Web feature implementation | `implement-fe-feature` | `component-architecture` |
| Code review or risk review | `reviewer` | `lawyer-management-system` |
| PR checklist/code review workflow | `code-review` | `reviewer` |
| Browser QA or user-flow testing | `ai-agent-testing` | `lawyer-management-system` |
| UI structure or UX decisions | `lawyer-management-system` | `ui-ux-pro-max` or `ux-ui-design` |
| Next.js routing or App Router work | `nextjs-app-router` | `lawyer-management-system` |
| Type safety or TS modeling | `typescript-best-practices` | `lawyer-management-system` |

## Intent Keywords to Skill

Use these keyword shortcuts for faster routing:

- "plan", "scope", "impact", "which files": `planner`
- "review", "audit", "find bug", "risk": `reviewer`
- "frontend + backend", "cross-project", "end-to-end feature": `fullstack`
- "api", "go", "sqlc", "migration", "gin": `common-api`
- "sqlc generate", "db query", "repository layer": `generate-db-layer`
- "migration", "schema change", "migrate create": `generate-migration`
- "swagger", "openapi", "swag": `generate-api-spec`
- "orval", "frontend types", "typed client": `generate-frontend-types`
- "gin handler", "request binding", "route registration": `implement-handler`
- "frontend feature", "table", "form", "hook", "schema": `implement-fe-feature`
- "PR checklist", "pre-merge", "review checklist": `code-review`
- "lawyer workflow", "dashboard", "crud", "management system": `lawyer-management-system`
- "next app router", "route segment", "layout": `nextjs-app-router`
- "typescript", "types", "generic", "narrowing": `typescript-best-practices`
- "browser test", "ui verify", "console/network": `ai-agent-testing`

## Usage Rules

- Start with one primary skill.
- Add a second skill only when the task clearly crosses boundaries.
- Never use more than two skills unless explicitly required.
- In this repository, default to `lawyer-management-system` before generic product, SEO, or landing-page guidance.
- Use `planner` for read-only scoping, `fullstack` for active cross-project implementation, and `reviewer` for inspection rather than authoring.
- Prefer the more specific skill over the more general one.

## Skill Selection Template

Before work, produce a one-line selection note:

`Primary: <skill>; Secondary: <skill or none>; Reason: <short reason>`

Example:

`Primary: lawyer-management-system; Secondary: planner; Reason: repo direction + scoping`

## Core workflow skills

| Skill | Use for |
| --- | --- |
| `lawyer-management-system` | Default repo context for this monorepo: management-system direction, no landing-page assumptions, no SEO-first decisions, and domain-aligned structure choices |
| `common-api` | Go backend implementation for `common-api/`: Gin, sqlc, PostgreSQL, migrations, handlers, services, middleware, and backend cleanup |
| `generate-db-layer` | sqlc query and generated database-layer changes |
| `generate-migration` | Root golang-migrate SQL migration creation and verification |
| `generate-api-spec` | Swagger/OpenAPI planning or generation; Swag is not installed yet |
| `generate-frontend-types` | Frontend API contract work; Orval is not installed yet, current pattern is Zod + apiFetch + hooks |
| `implement-handler` | Gin handler and route implementation pattern |
| `implement-fe-feature` | Web feature implementation using schemas, API modules, hooks, shadcn, tables, and forms |
| `planner` | Read existing code, scope work, map affected files, and create an implementation plan |
| `fullstack` | Changes that span frontend, backend, database, or multiple apps in the monorepo |
| `reviewer` | Code review, risk review, consistency checks, and post-change audits |
| `code-review` | Pre-merge checklist and cross-layer review workflow |

## Frontend and UX skills

| Skill | Use for |
| --- | --- |
| `ai-agent-testing` | Browser-based QA, UI verification, console/network debugging |
| `playwright-e2e` | End-to-end browser testing workflows |
| `ui-ux-pro-max` | Broad UI direction and visual-system support when the repo-specific Lawyer skill is not enough |
| `ux-ui-design` | UX/UI design guidance and reusable interface patterns |
| `responsive-design` | Responsive layout problems and breakpoint behavior |
| `nextjs-app-router` | Next.js App Router patterns and routing structure |
| `vercel-react-best-practices` | React and Next.js implementation rules and code quality |

| `component-architecture` | App-level design system using shadcn/ui, three-tier component organization, and reusable component patterns |
## Language and platform skills

| Skill | Use for |
| --- | --- |
| `typescript-best-practices` | Type safety, modeling, utilities, and TS architecture |
| `javascript-typescript-jest` | Jest-based testing and JS or TS unit test work |

## Web helper skills

These are root-level helper skills with `web-` prefixes for narrow web-specific work.

- `web-css-refactoring`
- `web-image-optimization`
- `web-loading-states`
- `web-performance-optimization`
- `web-route-handlers`
- `web-security-practices`

## Rules

1. Start with one primary skill.
2. Add a second skill only when the task clearly crosses boundaries.
3. Prefer the more specific skill over the more general one.
4. Do not begin execution before selecting a skill.
5. When adding a new skill, use `.github/skills/<skill-name>/SKILL.md` and make the description rich with trigger words.
6. In this repository, default to `lawyer-management-system` before generic product, SEO, or landing-page guidance.
7. Keep helper skills at root level with clear prefixes such as `web-` instead of nesting them in subfolders.

See `.github/skills/AUTHORING.md` for skill creation and maintenance rules.

Validation command:

`make validate-skills`

Run this command whenever you add or edit any file under `.github/skills/`.
