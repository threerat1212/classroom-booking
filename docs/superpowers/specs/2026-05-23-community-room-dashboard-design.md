# Community and Room Dashboard Design

Date: 2026-05-23

## Context

The project already has student dashboards, leaderboards, badges, titles, achievements, quests, classrooms, rewards, and role-based navigation. The new goal is to give students a shared place to show badges and achievements before they go to their private dashboard.

Approved direction: `Community Dashboard > Room Dashboard`, using the visual approach "Community Feed First".

## Goals

- Make the first student experience feel like a shared showcase, not only a private progress page.
- Show students only their own grade-level community, such as `M3` or `M4`.
- Let students enter the dashboard for their primary classroom from the community page.
- Keep the MVP simple for personal use now, while allowing multiple joined classrooms later.
- Keep admin responsibilities distinct from the student/teacher experience, while allowing admin to view all dashboard data.

## Roles and Access

- `student`: sees only their own `grade_level` community dashboard. They can open room dashboards only for classrooms they belong to.
- `teacher`: sees community and room dashboards only for grade levels and classrooms they teach.
- `admin`: can view all grade levels and classroom dashboards for support and audit, without replacing admin's existing meeting-room responsibilities.

Backend permission checks are required. The frontend should not be the source of truth for dashboard access.

## Data Model

Add `grade_level` to `users`.

- Primary use: identify a student's grade-level community.
- MVP values: `M3`, `M4`.
- Students must have a grade level before they can use Community Dashboard.

Add `grade_level` and `class_section` to `rooms`.

- Applies when `rooms.room_type = 'classroom'`.
- Example: `grade_level = 'M3'`, `class_section = '1'` displays as `ม.3/1`.
- Meeting rooms can leave both fields empty.

Add `is_primary` to `classroom_members`.

- Marks the student's main classroom for the MVP.
- Exactly one primary classroom per student should be enforced with a partial unique index on `student_id` where `is_primary = true`.
- When setting a new primary classroom, the service should unset any previous primary classroom for that student.
- Future multi-class support can keep this field as the default room while allowing multiple memberships.

## Main Flow

After login, students should land on `Community Dashboard` instead of `My Dashboard`.

Community Dashboard shows the student's grade-level community first, then offers entry into the student's primary room dashboard.

Flow:

1. Student logs in.
2. Student sees `Community Dashboard` for their own grade level.
3. Student clicks the primary classroom card.
4. Student lands on `Room Dashboard` for that classroom.
5. Student can still open `My Dashboard` for private progress.

For MVP, "currently studying classroom" means the student's primary classroom.

## Community Dashboard

Route: `/community`.

Students should be redirected or linked here after login. Teachers and admins can use the same route, but the available grade-level selector is scoped by backend access rules.

Primary content:

- Grade-level header, such as `Community ม.3`.
- Live Achievement Feed showing recent achievements, titles, level-ups, and notable badge unlocks in that grade level.
- Top Room summary for the grade level.
- Rare Badge count/highlights.
- Quest clear activity for the grade level.
- Weekly Highlight or champion area.
- Room dashboard cards, with the primary classroom emphasized for students.

Visual hierarchy:

- Feed comes first.
- Ranking is present, but not the whole page.
- Room entry is clear and easy to find.

## Room Dashboard

Route: `/classrooms/:id/dashboard`.

Primary content:

- Room header, such as `ม.3/1 Room Dashboard`.
- Room leaderboard based on XP.
- Badge Wall showing badges earned by students in that classroom.
- Class Quest Progress showing shared progress toward weekly or active quests.
- Recent Room Moments such as newly equipped titles, submitted quests, and new achievement unlocks.
- Link back to Community Dashboard.

Room Dashboard is scoped to one classroom and should not leak other grade-level or classroom data.

## API Design

Add `GET /api/v1/community-dashboard?grade_level=M3`.

Response should include:

- selected grade level
- accessible grade levels for the current user
- live achievement feed
- top rooms
- rare badge highlights/counts
- quest clear counts
- weekly highlight
- classroom cards
- primary classroom id when applicable

Access rules:

- student may request only their own grade level.
- teacher may request only grade levels they teach.
- admin may request any grade level.

Add `GET /api/v1/classrooms/:id/dashboard`.

Response should include:

- classroom summary
- room leaderboard
- badge wall
- quest progress
- recent room moments
- current user's relationship to the room

Access rules:

- student must be a classroom member.
- teacher must own or teach the classroom.
- admin may request any classroom.

## Empty and Error States

- Missing student `grade_level`: show a message asking teacher/admin to assign a grade level.
- Missing primary classroom: show a path to join or select a classroom.
- No achievements yet: show an empty state that says the grade has no moments yet.
- No room dashboard access: backend returns forbidden; frontend shows a not-allowed state.
- Missing classroom: show not found.

## Out of Scope for MVP

- Full multi-class switching.
- Timetable-based "currently studying" detection.
- Public share pages outside authenticated users.
- Student-to-student comments or reactions on achievements.
- Admin editing of all dashboard widgets from the dashboard page itself.

## Testing

Backend tests:

- Student `M3` cannot access `M4` community data.
- Student can open only classrooms where they are a member.
- Teacher can open only their taught grade levels and classrooms.
- Admin can open all grade levels and classrooms.
- Dashboard aggregations filter by grade level and classroom correctly.

Frontend checks:

- Type-check passes.
- Community Dashboard renders with data, loading, empty, and forbidden states.
- Room Dashboard renders with data, loading, empty, and forbidden states.
- Desktop and mobile visual smoke checks confirm the feed, room cards, leaderboard, and badge wall remain readable.

## Approved Visual Direction

Use the visual companion choice `A. Community Feed First`.

Community Dashboard should feel active and communal: the feed is the first major surface, with top-room and badge highlights beside it.

Room Dashboard should feel more focused: leaderboard, badge wall, class quest progress, and recent room moments for one classroom.
