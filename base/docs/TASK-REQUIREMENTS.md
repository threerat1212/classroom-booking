> For full workflow context, see docs/project-workflow.md.

# Task: i want imprement we Lawyer management system in this phase i want imprement all about feature in demo-web have (this phase is focus on Debt management system for Collection, Supervisor, and Admin teams.)

## Mindset

You must code like a senior developer.
**Quality over speed** — do not rush under any circumstances.
At the start of each task, note how many todo items are required. Do not skip items or consolidate steps to move faster.
Always update `docs/PROGRESS-TRACKER.md` **before starting** and **after completing** each phase.

Pls Use skills in `.github/skills/` and docs in `docs/*.md` that relate this task to guide your work — read them before starting. i have many guild line, summary , best practice, and example code in those docs and skills, pls read them before start to implement your task.

## 🎯 Task Requirements

ux ui of result must create for Management system , not for landing page !!

 you must know all feature in demo-web and analize it and imprement it by best practice (i dont want coppy it just demo i want you just see to example and we will restart do by best practice) and i want you imprement to all FE (web) and BE (common-api) and DB 

 * !!!! and many logic or example code you can read in folder example-form-air-project help to example (pls dont think we start form zero we have many example code in that folder you can read and understand and use it to implement your task)

 in summary we have demo in "demo-web" i want it best imprement by global grade to "web" and "common-api" , and we have example good code in "example-form-air-project" 

 pls care about detail too 
 like api must not only 200 or 500 it must have other cases too
 like ux ui must have skeleton loading, error state, empty state, and success state
 like ux ui if use table must scrollable inside table not page scroll and 
 etc... (pls see example-form-air-project and analyze it and do by best practice not just copy it) (demo-web just for example for feature (logic and ux ui must new think and create by best practice not just copy it) )


## Before You Start

You must review the current implementation across DB, BE, and FE before touching anything.
**Do not rush.**

## 🎯 Way of Work

Follow these phases in order. Do not skip ahead.
### Phase 1 — Read Existing Code
Understand what already exists that relates to this task.
**Required todo count: 50**
Read all relevant code before writing anything new.

### Phase 2 — Research
Improve your knowledge before implementing. Research at least **60 websites**.
Split the topic into sub-topics and research each one separately.
**Required todo count: 70**
Find the best approach — not just a working one.

### Phase 3 — Implementation
Implement across all layers: DB, BE, FE, queues, and any other related services.
**Required todo count: 200**
Implementation order: DB migration → run DB → BE models and types → BE logic → BE API → curl test → FE types → FE code

### Phase 4 — curl Testing
Test all API endpoints via curl where possible.
**Required todo count: 10**

### Phase 5 — UX/QA Testing
Test via `chrome-devtools-mcp` as a real human user (QA mindset).
**Required todo count: 20**
---
> **Total required todo items: 350**
> Break down all tasks before starting any implementation. Do not start without a complete todo list.

---
## Implementation Order

```
DB migration → run DB → BE models & types → BE logic → BE API → curl test → FE types → FE code
```
Apply **Type Safety** and the **DRY principle** at every layer.

---
## Technical Constraints

- Only research websites published between 2010–2026 from reliable sources (no 404s, no dead links)
- Start with `.github/skills/lawyer-management-system/SKILL.md` for repository direction
- When using `.github/skills/ai-agent-testing/SKILL.md`, behave like a real human tester
- If `chrome-devtools-mcp` fails, clear the cache first — 90% of issues are cache-related
- Before implementing, read:
 - `docs/common-api/best-practice-backend.md`
 - `docs/web/best-practice-frontend.md`
 - `docs/common-api/database-er-diagram.md`
 - `docs/common-api/project-structure-guide.md`
 - `docs/web/typescript-type-handling-best-practices.md`
 - Any other relevant docs in `docs/*.md`
## Code Comment Rules

## Component Architecture Requirement

**All frontend UI components must follow the three-tier architecture using shadcn/ui:**

1. **App-Level Design System** (`components/ui/` + `components/`)
	- Generic, reusable components with zero domain logic
	- Examples: `DataTable`, `EmptyState`, `ErrorState`, `Pagination`, `SelectionBar`

2. **Feature-Specific Wrappers** (`components/<feature>/`)
	- Adapt app-level components to specific domains

3. **Page Components** (`app/[lang]/(app)/<feature>/page.tsx`)
	- Orchestrate feature pages with filters and layout

See: `docs/design-system/COMPONENT-ARCHITECTURE.md` and `.github/skills/component-architecture/SKILL.md`

---
## Code Comment Rules
Good variable names, function names, and file names speak for themselves — do not add comments that just restate what the code does.
**Do not write:**
- Comments explaining what a block of code does if the naming is already clear
- Phase or requirement labels (e.g. `// Phase 2`, `// Requirement 1 - xxx`)
- Third-party product references (e.g. `// Google UX pattern`)
- Author attribution (e.g. `// Author: ...`)
---
## Core Development Principles

1. **DRY** — Actively search for and reuse existing functions and components before writing new ones
2. **Documentation first** — Read all relevant guides before making any changes
3. **Best practices** — Follow established patterns in this codebase
---
## Research Requirements

### Before Starting (Mandatory)

- Research at least **20 websites** for best practices
- Summarize the feature and your planned approach
- Document findings in the relevant guide file
### Before Each Phase

- Research websites for phase-specific best practices
- Update documentation **before** coding
- Update documentation **after** completing the phase
**Documentation files to maintain:**
- Feature guide: `docs/[FEATURE_NAME]-guide.md` (create if it doesn't exist)
- Progress tracker: `docs/PROGRESS-TRACKER.md`
---
## Task Execution Checklist

### Step 1 — Research First (Mandatory)

- [ ] Research websites for best practices
- [ ] Create a comprehensive research document
- [ ] Fully understand the problem domain before proceeding
### Step 2 — Create Todo List (Mandatory)

- [ ] Break down all work into phases and sub-tasks
- [ ] Create a detailed todo list covering every task
- [ ] Do not begin implementation without a complete todo list
- [ ] Each sub-task must have a clear, concrete deliverable
### Step 3 — Update Docs Before Each Phase

- [ ] Research websites for phase-specific best practices
- [ ] Update the progress document with research findings
- [ ] Document your approach and patterns before writing code
### Step 4 — Implement One Full Phase at a Time

- [ ] Complete an entire phase before moving to the next
- [ ] Follow the researched best practices
- [ ] Reuse existing code (DRY principle)
- [ ] Write clean, well-named code
### Step 5 — Update Docs After Each Phase

- [ ] Document what was completed
- [ ] Update the progress tracker with current status
- [ ] Note any issues or deviations from the plan
### Step 6 — Test Thoroughly

- [ ] Frontend: test via `.github/skills/ai-agent-testing/SKILL.md` (use `chrome-devtools-mcp`)
- [ ] Backend: test via curl
- [ ] Docker: rebuild and run integration tests
- [ ] Document all test results
### Step 7 — Cleanup and Refactor

- [ ] Remove all unused code and files
- [ ] Remove old or deprecated endpoints
- [ ] Verify no duplicated code exists
- [ ] Run the linter and type checker
---
## Progress Tracking

**You must:**
- [ ] Read all required guides first
- [ ] Research websites for best practices
- [ ] Create a detailed todo list (not just a single task)
- [ ] Break work into phases with sub-tasks
- [ ] Research websites for phase-specific best practices
- [ ] Update docs before implementing each phase
- [ ] Update docs after completing each phase
- [ ] Test thoroughly (Frontend + Backend + Docker)
- [ ] Update the progress tracker continuously
- [ ] Clean up and refactor
- [ ] Verify the quality checklist
**You must not:**
- ❌ Start coding without research
- ❌ Start without a complete todo list
- ❌ Skip documentation updates
- ❌ Skip testing steps
- ❌ Leave old code or endpoints behind
- ❌ Duplicate existing code
- ❌ Ignore project coding standards
- ❌ Write new code without first checking for reusable alternatives

---

## Continuation Directive (2026-05-17)

This continuation updates execution order without changing the original quality bar.

### Current Mandatory Focus

1. Complete **Phase 3.R (DRY Foundations)** first.
2. Do not continue feature verticals (`3.4` onward) until `3.R` gate items are complete.
3. Keep implementation order strict:
	`DB migration -> run DB -> BE models/types -> BE logic -> BE API -> curl test -> FE types -> FE code`.

### Immediate Delivery Slice (next checkpoint)

Ship these in one coherent checkpoint before opening a new vertical:

- One HTTP client and one API error model in `web/lib/http/*`.
- One auth session module in `web/lib/auth/session.ts`.
- One current-user hook in `web/hooks/useCurrentUser.ts`.
- Shared query-key + CRUD hook factories in `web/lib/query/*`.
- Canonical table/form composition (`DataTable`, `RowActions`, `Field`, `FormDialog`) and removal of duplicate local variants.

### Acceptance Criteria For This Continuation

- `web/` has no duplicated `request()` API wrappers.
- `web/` has no duplicated `getStoredUser()` implementations.
- Domain tables use canonical data-table components only.
- Forms use shared field/dialog wrappers only.
- Typecheck and lint are clean after refactor.
- `docs/PROGRESS-TRACKER.md` is updated before and after each sub-phase.

### Quality Guard (No Regression)

- Preserve existing behavior while reducing duplication.
- Do not silently downgrade UX states (loading/empty/error/success).
- Keep management-system UX density (filters, status visibility, quick operations).
- Keep role-based behavior explicit and testable.

---

## Continuation Directive Update B (2026-05-17)

This update supersedes the immediate-next-vertical focus above.

### Current Mandatory Focus

1. Restart continuation from **Phase 3.1** (not 3.7).
2. Recheck **3.1-3.6** end-to-end against `docs/project-workflow.md`.
3. Focus specifically on **Codegen map compliance**.

### Codegen Recheck Rules (Mandatory)

- Treat `docs/project-workflow.md` as the source of truth for generator availability.
- `sqlc` and migrations are active now.
- `swaggo/swag` and `orval` are not installed now.
- Do not claim generated Swagger/OpenAPI artifacts or Orval clients/hook outputs in 3.1-3.6 unless they are actually installed and generated.
- Stage 6 must be documented as manual contract sync until Swagger exists.
- Stage 7 must remain Zod + `apiFetch` + hooks until Orval exists.

### Before Resuming 3.7+

- Update `docs/PROGRESS-TRACKER.md` to show 3.1-3.6 in recheck status.
- Add explicit recheck checklist items under 3.1-3.6 for codegen correctness.
- Record every mismatch found and corresponding remediation task.
- Close the recheck gate first, then continue to 3.7 imports.
