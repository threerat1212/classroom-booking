# Task: [FILL IN]

## Mindset
You must code like a senior developer.
**Quality over speed** — do not rush under any circumstances.
At the start of each task, note how many todo items are required. Do not skip items or consolidate steps to move faster.
Always update `docs/PROGRESS-TRACKER.md` **before starting** and **after completing** each phase.
Use skills in `.agents/skills/` and docs in `docs/*.md` to guide your work — read them before starting.

## 🎯 Task Requirements
1.I want to build a "Classroom & Meeting Room Management System" for a school. 
2.which must have Authentication & Roles (Login system,Clear role separation: Admin, Teacher, Student, Guest) 
3.Have Core Database (Users,Rooms,Bookings,etc.)
4.User Interface (UI)
- Calendar View: An easy-to-visualize overview of room availability.
- Booking Form: Allows users to select the desired room, date, and time.
- Admin Dashboard: Allows admins to add/edit/delete room information and manage all reservations. 
5.Core Logic
- Overlap Prevention: This is the most critical part. The system must detect if a user's requested booking time overlaps or conflicts with an existing booking. If there is a time clash, the system must not allow the booking to proceed.
6.Features for Teachers (Teacher View) 
- Attendance Tracking System: Record students' presence, tardiness, leave, and absence for each session.
- Assignment & Task Management: Create assignments, attach files or sample videos, and configure them as individual or group work.
- Real-time Grading System: Input scores for assignments (or use a grading rubric). The scores will be processed and updated instantly for students to see.
- Data Export System: Summarize total scores and attendance statistics, then download them as Excel or CSV files for further use.
7.Features for Students (Student View)
- Flexible Submission System: Support uploading image and document files, as well as attaching external project links (e.g., code on GitHub or design projects on Figma/Canva).
- Personal Status Dashboard: View overall scores, check the list of pending/missing assignments, and monitor the total number of absences at any time.
- Notification System: Send alerts when there is a new assignment, an upcoming deadline, or when the teacher has finished grading (e.g., via in-app notifications or LINE integration).
- Discussion Channel: Provide a comment section under each assignment to directly ask questions or clarify doubts regarding that specific task.
- Gamification System: Award badges to students who submit all work, submit on time, or achieve the highest scores to make the learning experience more engaging and fun.
8.Have Ai for help (teacher,student,etc) > i will add api later 

## Before You Start
You must review the current implementation across DB, BE, and FE before touching anything.
**Do not rush.**
Update `docs/PROGRESS-TRACKER.md` before starting and after finishing.
> ⚠️ Deploying to the production server is strictly forbidden.
---

## 🎯 Way of Work
Follow these phases in order. Do not skip ahead.

### Phase 1 — Read Existing Code
Understand what already exists that relates to this task.
**Required todo count: 40**
Read all relevant code before writing anything new.

### Phase 2 — Research
Improve your knowledge before implementing. Research at least **60 websites**.
Split the topic into sub-topics and research each one separately.
**Required todo count: 60**
Find the best approach — not just a working one.

### Phase 3 — Implementation
Implement across all layers: DB, BE, FE, queues, and any other related services.
**Required todo count: 200**
Implementation order: DB migration → run DB → BE models and types → BE logic → BE API → curl test → FE types → FE code

### Phase 4 — curl Testing
Test all API endpoints via curl where possible.
**Required todo count: 20**

### Phase 5 — UX/QA Testing
Test via `chrome-devtools-mcp` as a real human user (QA mindset).
**Required todo count: 50**
---
> **Total required todo items: 370**
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
- When using `.agents/skills/ai-agent-testing/SKILL.md`, behave like a real human tester
- If `chrome-devtools-mcp` fails, clear the cache first — 90% of issues are cache-related
- Before creating any modal, read `web/docs/modal-layout-guild.md`
- Before implementing, read:
 - `docs/best-practice-backend.md`
 - `docs/best-practice-frontend.md`
 - `docs/database-er-diagram.md`
 - `docs/project-structure-guide.md`
 - `docs/typescript-type-handling-best-practices.md`
 - Any other relevant docs in `docs/*.md`
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
- [ ] Frontend: test via `.agents/skills/ai-agent-testing/SKILL.md` (use `chrome-devtools-mcp`)
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
