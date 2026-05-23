# Community Room Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Community Dashboard and Room Dashboard so students can showcase grade-level and classroom achievements before opening their private dashboard.

**Architecture:** Add grade-level metadata to users/classrooms and primary-classroom metadata to memberships. Backend exposes scoped dashboard aggregate endpoints with permission checks; frontend renders `/community` and `/classrooms/[id]/dashboard` using existing dark dashboard UI patterns.

**Tech Stack:** Go + Gin + pgx/PostgreSQL migrations for backend, Next.js App Router + React Query + Tailwind + lucide-react for frontend.

---

## File Structure

- Create `migrations/000040_community_dashboards.up.sql`: add `grade_level`, `class_section`, `is_primary`, indexes, and safe demo defaults.
- Create `migrations/000040_community_dashboards.down.sql`: remove the new fields/indexes.
- Modify `common-api/internal/model/user.go`: add `GradeLevel`.
- Modify `common-api/internal/model/classroom.go`: add `GradeLevel`, `ClassSection`, `IsPrimary`, and dashboard response structs.
- Modify `common-api/internal/service/user.go`: scan and write `grade_level`.
- Modify `common-api/internal/service/classroom.go`: scan classroom metadata, set first joined room as primary, and support dashboard authorization.
- Create `common-api/internal/service/dashboard.go`: dashboard aggregate queries, access helpers, and response shaping.
- Create `common-api/internal/service/dashboard_test.go`: TDD tests for grade access and display helpers.
- Create `common-api/internal/handler/dashboard.go`: community and classroom dashboard handlers.
- Modify `common-api/internal/handler/handler.go`: wire `DashboardHandler`.
- Modify `common-api/internal/router/router.go`: add `GET /community-dashboard` and `GET /classrooms/:id/dashboard`.
- Create `web/lib/api/dashboards.ts`: typed frontend API helpers.
- Modify `web/lib/auth/session.ts` and `web/hooks/useCurrentUser.ts`: preserve `grade_level`.
- Modify `web/app/login/page.tsx`: route students to `/community` after login.
- Modify `web/components/shared/app-shell.tsx`: add Community nav item and keep My Dashboard as personal page.
- Create `web/app/(app)/community/page.tsx`: Community Dashboard UI.
- Create `web/app/(app)/classrooms/[id]/dashboard/page.tsx`: Room Dashboard UI.

## Task 1: Backend Permission Helpers

**Files:**
- Create: `common-api/internal/service/dashboard_test.go`
- Create: `common-api/internal/service/dashboard.go`

- [ ] **Step 1: Write failing tests**

Add tests for grade access and Thai display labels:

```go
func TestCanAccessGrade(t *testing.T) {
    cases := []struct {
        name          string
        role          string
        userGrade     string
        requested     string
        teacherGrades []string
        want          bool
    }{
        {"student own grade", "student", "M3", "M3", nil, true},
        {"student other grade", "student", "M3", "M4", nil, false},
        {"teacher taught grade", "teacher", "", "M4", []string{"M3", "M4"}, true},
        {"teacher untaught grade", "teacher", "", "M2", []string{"M3", "M4"}, false},
        {"admin any grade", "admin", "", "M4", nil, true},
    }
    for _, tc := range cases {
        if got := canAccessGrade(tc.role, tc.userGrade, tc.requested, tc.teacherGrades); got != tc.want {
            t.Fatalf("%s: canAccessGrade() = %v, want %v", tc.name, got, tc.want)
        }
    }
}

func TestGradeDisplayName(t *testing.T) {
    if got := gradeDisplayName("M3"); got != "ม.3" {
        t.Fatalf("gradeDisplayName(M3) = %q", got)
    }
}
```

- [ ] **Step 2: Run tests and verify RED**

Run: `go test ./internal/service -run 'TestCanAccessGrade|TestGradeDisplayName'`

Expected: fail because helpers are undefined.

- [ ] **Step 3: Implement minimal helpers**

Add `dashboard.go` with `canAccessGrade`, `gradeDisplayName`, and the dashboard response structs used by service and handler code.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `go test ./internal/service -run 'TestCanAccessGrade|TestGradeDisplayName'`

Expected: pass.

## Task 2: Database and Models

**Files:**
- Create: `migrations/000040_community_dashboards.up.sql`
- Create: `migrations/000040_community_dashboards.down.sql`
- Modify: `common-api/internal/model/user.go`
- Modify: `common-api/internal/model/classroom.go`
- Modify: `common-api/internal/service/user.go`
- Modify: `common-api/internal/service/classroom.go`

- [ ] **Step 1: Add migration**

Add nullable `grade_level` to `users`; nullable `grade_level` and `class_section` to `rooms`; `is_primary` to `classroom_members`; indexes for grade filtering and primary memberships.

- [ ] **Step 2: Add model fields**

Expose `grade_level`, `class_section`, and `is_primary` in JSON models.

- [ ] **Step 3: Update scans/inserts**

Update user and classroom SELECT/RETURNING scans. Classroom join should set `is_primary = true` only when the student has no primary classroom.

- [ ] **Step 4: Verify backend compile**

Run: `go test ./internal/service`

Expected: pass.

## Task 3: Dashboard Backend Endpoints

**Files:**
- Modify: `common-api/internal/service/dashboard.go`
- Create: `common-api/internal/handler/dashboard.go`
- Modify: `common-api/internal/service/service.go`
- Modify: `common-api/internal/handler/handler.go`
- Modify: `common-api/internal/router/router.go`

- [ ] **Step 1: Add dashboard service**

Implement `CommunityDashboard(ctx, userID, role, requestedGrade)` and `ClassroomDashboard(ctx, classroomID, userID, role)`.

- [ ] **Step 2: Add handlers**

Read authenticated user info from Gin context, call service, return `response.OK`, and map forbidden/not-found to existing response helpers.

- [ ] **Step 3: Add routes**

Add protected `GET /api/v1/community-dashboard` and `GET /api/v1/classrooms/:id/dashboard`.

- [ ] **Step 4: Verify backend**

Run: `go test ./...`

Expected: pass.

## Task 4: Frontend API and Routing

**Files:**
- Create: `web/lib/api/dashboards.ts`
- Modify: `web/lib/auth/session.ts`
- Modify: `web/hooks/useCurrentUser.ts`
- Modify: `web/app/login/page.tsx`
- Modify: `web/components/shared/app-shell.tsx`

- [ ] **Step 1: Add typed API helpers**

Create `getCommunityDashboard(gradeLevel?: string)` and `getClassroomDashboard(classroomId: string)`.

- [ ] **Step 2: Preserve grade level in session**

Add `grade_level?: string` to `StoredUser`, `normalizeUser`, and login storage.

- [ ] **Step 3: Route students after login**

After login, route `student` users to `/community`; other roles continue to `/dashboard`.

- [ ] **Step 4: Add navigation**

Add `/community` under Overview for student, teacher, and admin. Keep `/student/dashboard` as `My Dashboard`.

## Task 5: Frontend Community and Room Pages

**Files:**
- Create: `web/app/(app)/community/page.tsx`
- Create: `web/app/(app)/classrooms/[id]/dashboard/page.tsx`

- [ ] **Step 1: Build Community Dashboard**

Render header, grade selector for accessible grades, live feed, top rooms, highlights, and room cards. Use existing dark panels and lucide icons.

- [ ] **Step 2: Build Room Dashboard**

Render room leaderboard, badge wall, quest progress, and recent moments with a link back to `/community`.

- [ ] **Step 3: Add empty/error/loading states**

Handle missing grade, no moments, no primary classroom, forbidden, and loading states.

- [ ] **Step 4: Verify frontend**

Run: `npm run type-check` in `web`.

Expected: pass.

## Task 6: Full Verification

**Files:**
- No new files unless verification reveals issues.

- [ ] **Step 1: Run backend tests**

Run: `go test ./...` in `common-api`.

- [ ] **Step 2: Run frontend type-check**

Run: `npm run type-check` in `web`.

- [ ] **Step 3: Run local app and browser smoke test**

Start or reuse the local API/web servers. Open `/community` and a room dashboard in the browser and check desktop/mobile layouts for readable feed, room cards, leaderboard, and badge wall.
