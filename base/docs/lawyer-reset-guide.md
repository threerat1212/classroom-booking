> For full workflow context, see docs/project-workflow.md.

# Lawyer Reset Guide

## Goal

Transform inherited SEO/landing-oriented code into a Lawyer management-system baseline with clean, day-one implementation.

## Phase Breakdown

## Phase 1 Read Existing Code (40 todo target)

- Audit backend routes, handlers, services, models, SQL queries, and env defaults.
- Audit frontend routes, app-config data, sections, metadata, and page content.
- Audit duplicated docs and skills inside subprojects.
- Produce explicit reset scope for docs, FE, BE, and shared structure.

Deliverable:
- Approved scope and concrete reset checklist.

## Phase 2 Research (60 todo target)

- Validate monorepo documentation conventions.
- Validate clean starter architecture patterns for Next.js and Go API.
- Validate internal standards from project docs and installed skills.

Deliverable:
- Confirmed architecture direction and implementation constraints.

## Phase 3 Implementation (200 todo target)

Execution order for this reset:

1. Structure cleanup:
- Move subproject docs into root docs folders.
- Move subproject skills into root .github skills folders.

2. Documentation cleanup:
- Update project positioning to Lawyer management system.
- Remove or rewrite SEO/landing strategy docs.

3. Backend reset (common-api):
- Keep project skeleton and quality middleware stack.
- Remove advanced CMS-specific features.
- Keep day-one endpoints: health + core user CRUD baseline.
- Align env/database naming away from SEO terminology.

4. Frontend reset (web):
- Replace landing/portfolio/blog/services content with management-system baseline UI.
- Remove SEO-specific section types and content blocks not needed for management baseline.
- Keep stable Next.js App Router and typing patterns.

Deliverable:
- Clean day-one FE/BE implementation with updated docs.

## Phase 4 curl Testing (20 todo target)

- Validate API health endpoint.
- Validate baseline CRUD endpoints.
- Record results and failures.

Deliverable:
- curl evidence summary in progress tracker.

## Phase 5 UX/QA Testing (50 todo target)

- Run management baseline UI flow checks.
- Verify legacy marketing experience is removed from primary flows.
- Verify no broken routes from removals.

Deliverable:
- QA result summary and outstanding risks list.
