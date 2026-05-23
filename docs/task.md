# Current Task Status

Date: 2026-05-23

## Completed

- Reward Shop database migration with quest-based rewards and redemption tracking.
- Reward Shop backend API for listing rewards, redeeming with Gold, and teacher/admin redemption review.
- Student Reward Shop page with category tabs, Gold balance, limits, and redemption history.
- Sidebar entry for `Reward Shop`.
- Retired the old avatar/customization surface from student navigation and attendance displays.
- Attendance records keep student name, title, and status for classroom/projector display.
- Live attendance flexboard page simplified into a roster-focused projector view.
- Assignment discussion comments API and frontend UI.
- AI tutor prompt tightened to classroom-only scope.
- Missing attendance session detail route added for frontend pages.

## Fixed During Review

- Imported missing `HelpCircle` icon in the attendance detail page.
- Changed attendance SQL from `users.name` to `users.full_name`.
- Changed attendance SQL from `check_in_time/check_out_time` to `check_in_at/check_out_at`.
- Passed `marked_by` when creating/updating attendance records.
- Removed avatar unlock/equip state from achievement and attendance flows.

## Verification

- `go test ./...` passed.
- `go build ./cmd/api` passed.
- `npm run type-check` passed.
- `npm run build` passed.
- Local API smoke passed for rewards, comments, and attendance.
- Local browser smoke passed for Reward Shop, attendance flexboard, and assignment discussion.

## Notes

- `claude-smart@0.2.31` was inspected and attempted with `--host codex`.
- The install did not complete because the shell cannot spawn the WindowsApps Codex binary (`spawn EPERM` / access denied).
