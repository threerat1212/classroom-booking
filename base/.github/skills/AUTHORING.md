# Skill Authoring Guide

Use this guide when creating or updating skills in this repository.

For full workflow context, see `docs/project-workflow.md`.

## Goals

- Make skill discovery predictable
- Keep repository direction consistent
- Reduce duplicated or conflicting instructions

## File Structure

Every skill must use this shape:

```text
.github/skills/<skill-name>/
  SKILL.md
```

Also include these root files:

```text
.github/skills/README.md
.github/skills/QUICKSTART.md
.github/skills/validate-skills.sh
```

Do not create nested namespaces such as `.github/skills/web/...`. Keep all skills at the root skill level and use prefixes like `web-` when you need grouping.

Optional supporting files:

```text
.github/skills/<skill-name>/references/
.github/skills/<skill-name>/scripts/
.github/skills/<skill-name>/assets/
```

## Naming Rules

- Folder name: lowercase with hyphens
- Main file: exact uppercase `SKILL.md`
- `name` in frontmatter must match the folder name exactly
- `argument-hint` is required in frontmatter for easier invocation
- Keep names short and task-oriented
- Use prefixes such as `web-` when you need to organize related helper skills without nesting

## Description Rules

The description is the main discovery surface.

- Include the task type
- Include trigger words users actually say
- Include when to use the skill
- Include what the skill should avoid when relevant

Good pattern:

```yaml
description: "Use for Lawyer management system decisions, admin workflows, CRUD screens, docs alignment, and monorepo cleanup. Avoid landing-page assumptions and SEO-first choices."
```

## Writing Rules

- Keep `SKILL.md` concise and procedural
- Put large datasets or long references outside the main file
- Prefer repository-specific guidance over generic product advice
- Do not duplicate the same rule across many skills unless the rule is truly local to that skill

## Skill Selection Rules

- Default to `lawyer-management-system` for repository direction
- Use `planner` for scoping
- Use `fullstack` for cross-project changes
- Use `reviewer` for audits and findings
- Add framework or language skills only when the task needs them

## Maintenance Rules

- Remove stale counts and obsolete skill names from docs
- Update root `.github/skills/README.md` when adding a skill
- Update `.github/skills/QUICKSTART.md` when routing defaults change
- Update root or path-specific instructions when routing changes
- Keep `web/.github/` and `common-api/.github/` aligned to the root catalog
- Prefer flatter structure over nested skill folders for discoverability

## Validation

Run this before finalizing any skill update:

```bash
.github/skills/validate-skills.sh
```

Validation checks:

- Empty top-level skill directories
- Missing `SKILL.md`
- Frontmatter `name` mismatch with folder name
- Missing `description`
- Missing `argument-hint`

## macOS Note

On case-insensitive filesystems, rename `skill.md` to `SKILL.md` through an intermediate filename:

```text
skill.md -> SKILL.tmp -> SKILL.md
```