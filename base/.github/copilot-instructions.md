## Management System Notice

This repository targets a Lawyer management system.

# Monorepo Custom Instructions for GitHub Copilot

This is a Makefile-managed monorepo focused on a Lawyer management system. All projects share a single Git repository.

For the full requirement-to-production workflow, see `docs/project-workflow.md`.

## Project Map

| Project | Path | Stack | Purpose |
| ------- | ---- | ----- | ------- |
| web | `web/` | Next.js, React, TypeScript, Tailwind | Management system frontend |
| common-api | `common-api/` | Go, Gin, PostgreSQL, sqlc, JWT | Backend REST API for core management flows |
| docs | `docs/` | Markdown | Shared monorepo documentation |

## Quick Commands

- **Install all**: `make install`
- **First-time setup**: `make setup`
- **Dev all**: `make dev`
- **Dev web**: `make dev-web` (port 3000)
- **Demo/reference app**: `cd demo-web && pnpm dev -- -p 3001` (reference only)
- **Dev api**: `make dev-api` (port 3002)
- **Local DB**: `make db-up` / `make db-down`
- **Build all**: `make build`
- **Lint all**: `make lint`
- **Test all**: `make test`
- **Status**: `make status`

## Skill-First Workflow

Before planning, coding, reviewing, or testing, check `.github/skills/README.md` and load the most relevant skill for the task.

### Mandatory skill selection

For every request, select a skill first and declare it in one line:

`Primary: <skill>; Secondary: <skill or none>; Reason: <short reason>`

Do not continue to implementation before this selection exists.

If unsure, use `lawyer-management-system` as the default primary skill.

- Prefer the repo-specific `lawyer-management-system` skill whenever the task affects product behavior, docs, UI, architecture, or implementation patterns in this repository
- Prefer a matching skill over ad-hoc behavior whenever a skill exists
- If multiple skills match, use the most specific one first, then add a broader skill only if needed
- If no existing skill fits, say that explicitly before continuing without one
- Keep selection simple: one primary skill, optional one secondary skill
- Keep new skills inside `.github/skills/<skill-name>/SKILL.md` using lowercase folder names and uppercase `SKILL.md`
- After any `.github/skills/` updates, run `make validate-skills` before finalizing

All AI skills are consolidated at root `.github/skills/` so they are always discovered regardless of which folder you open. Instructions in `.github/instructions/` use `applyTo` patterns to target specific projects.

See also:

- `docs/project-workflow.md` — Single source of truth for feature workflow, codegen status, commands, and conventions
- `.github/skills/` — All agent skills (frontend, backend, testing)
- `.github/skills/README.md` — Skill catalog and usage map
- `.github/skills/AUTHORING.md` — How to choose, combine, and create skills in this repo

All project skills live directly under `.github/skills/<skill-name>/SKILL.md`. Do not create nested skill namespaces.
