---
name: planner
description: "Read-only planning skill. Use when the task is to read existing code, scope a change, identify affected files, and prepare an implementation plan before editing. Do not use as the primary implementation skill."
argument-hint: "Describe the feature, bug, or refactor to plan"
---

# Planner

For full workflow context, see `docs/project-workflow.md`.

Use this skill before making substantial changes.

## When to use

- New feature requests
- Refactors with unclear impact
- Cross-project changes
- Requests that need file discovery before editing

## Workflow

1. Read the relevant code before proposing changes.
2. Identify which projects are affected: `web/`, `dept-collector-app/`, `common-api/`, or shared `docs/`.
3. Point to existing patterns that should be reused.
4. Produce a concrete implementation plan with likely files and risks.

## Rules

- Stay grounded in the current repository structure.
- Prefer existing patterns over inventing new structure.
- Call out cross-project dependencies early.
- Keep the plan actionable and file-oriented.