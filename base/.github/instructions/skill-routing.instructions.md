---
applyTo: "**"
description: "Force a skill-first workflow. Use when planning, implementing, reviewing, testing, or refactoring so the agent checks .github/skills before acting."
---

# Skill Routing

Use `.github/skills/README.md` as the first routing table for this workspace.

For full workflow context, see `docs/project-workflow.md`.

## Mandatory gate

For every user request, select a skill before planning, coding, testing, or reviewing.

- Do not proceed with implementation without a selected primary skill.
- If uncertain, default to `lawyer-management-system`.
- Add one secondary skill only when required by scope.
- If no skill matches, explicitly state that and continue with repository instructions.

## Required behavior

1. Before substantial work, identify the closest matching skill in `.github/skills/README.md`.
2. Write a one-line selection note: `Primary: <skill>; Secondary: <skill or none>; Reason: <short reason>`.
3. Use that skill's workflow and constraints while doing the task.
4. If the task spans multiple areas, combine only the smallest useful set of skills.
5. If no skill fits, state that clearly and proceed with the repository instructions.

## Default routing

- Lawyer repository direction, management-system decisions, or docs alignment: use `lawyer-management-system`
- Planning or breaking work down: use `planner`
- Cross-project implementation: use `fullstack`
- Go backend/API work in `common-api/`: use `common-api`
- sqlc query/database generated layer work: use `generate-db-layer`
- database migration work: use `generate-migration`
- Swagger/OpenAPI work: use `generate-api-spec`
- frontend API contract/type generation work: use `generate-frontend-types`
- Gin handler implementation: use `implement-handler`
- web feature implementation: use `implement-fe-feature`
- Code review or audit: use `reviewer`
- pre-merge checklist review: use `code-review`
- Browser QA or UI verification: use `ai-agent-testing`
- UI and interaction design: use `lawyer-management-system` first, then `ui-ux-pro-max` or `ux-ui-design` only as secondary support
- Next.js App Router work: use `nextjs-app-router`
- TypeScript quality work: use `typescript-best-practices`

## Authoring rules

- New skills must live in `.github/skills/<skill-name>/SKILL.md`
- Folder names must match the `name` field
- Keep all skills at the root `.github/skills/` level rather than nested namespaces
- Use keyword-rich descriptions so automatic discovery works reliably
- Keep the main `SKILL.md` concise and push large references into nearby files