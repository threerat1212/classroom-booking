# Skills Quickstart

Use this file when you want the fastest path to the right skill.

For full workflow context, see `docs/project-workflow.md`.

## 1-step rule

Pick one primary skill before doing any work.

If you are unsure, use `lawyer-management-system`.

## Quick map

- Planning, scope, affected files: `planner`
- Lawyer product direction, docs, UI structure: `lawyer-management-system`
- Backend API in `common-api/`: `common-api`
- sqlc query/generation: `generate-db-layer`
- DB migration: `generate-migration`
- Swagger/OpenAPI: `generate-api-spec`
- Frontend API contracts or Orval: `generate-frontend-types`
- Gin handler implementation: `implement-handler`
- Web feature implementation: `implement-fe-feature`
- Cross-project implementation: `fullstack`
- Review, bug/risk audit: `reviewer` or `code-review`
- Browser QA and user-flow checks: `ai-agent-testing`
- Next.js App Router changes: `nextjs-app-router`
- TypeScript quality and typing: `typescript-best-practices`

## Selection format

Use this line before action:

`Primary: <skill>; Secondary: <skill or none>; Reason: <short reason>`

Example:

`Primary: common-api; Secondary: reviewer; Reason: API behavior + risk review`

## Keep it simple

- Default: one skill.
- Add a second skill only if the task clearly spans two domains.
- If no skill matches, state that clearly and continue with repository instructions.

## Validate before PR

Run:

`make validate-skills`

This checks skill folder structure and required metadata.
