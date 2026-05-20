# Current Task Status

Date: 2026-05-20

## Completed

- Character cosmetics database migration with seeded hair, hat, outfit, and aura items.
- Character inventory/equip backend API.
- Automatic cosmetic unlocks from earned learning titles.
- Student wardrobe page with layered 2D character preview.
- Sidebar entry for `My Character`.
- Attendance records enriched with student name, title, and equipped cosmetic item codes.
- Live attendance flexboard page for classroom/projector display.
- Assignment discussion comments API and frontend UI.
- AI tutor prompt tightened to classroom-only scope.
- Missing attendance session detail route added for frontend pages.

## Fixed During Review

- Imported missing `HelpCircle` icon in the attendance detail page.
- Changed attendance SQL from `users.name` to `users.full_name`.
- Changed attendance SQL from `check_in_time/check_out_time` to `check_in_at/check_out_at`.
- Passed `marked_by` when creating/updating attendance records.
- Cast character equip unlock comparison params to `int` to avoid pgx encode errors.

## Verification

- `go test ./...` passed.
- `go build ./cmd/api` passed.
- `npm run type-check` passed.
- `npm run build` passed.
- Local API smoke passed for character, comments, and attendance.
- Local Playwright smoke passed for character wardrobe, attendance flexboard, and assignment discussion.

## Notes

- `claude-smart@0.2.31` was inspected and attempted with `--host codex`.
- The install did not complete because the shell cannot spawn the WindowsApps Codex binary (`spawn EPERM` / access denied).
