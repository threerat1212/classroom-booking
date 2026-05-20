# Walkthrough

Date: 2026-05-20

## Student Character Flow

1. Student opens `My Character` from the sidebar.
2. Frontend calls `GET /api/v1/character`.
3. Backend initializes a default character if the user has no character row yet.
4. Inventory items are returned with `is_unlocked`, based on level, earned title, or explicit unlock.
5. Student equips an unlocked item through `POST /api/v1/character/equip`.

## Title Unlock Flow

1. Student completes learning quest work.
2. Achievement service awards eligible titles.
3. `awardTitleTx` also unlocks character items whose `required_title_code` matches the earned title.
4. Newly unlocked cosmetics become available on the wardrobe page.

## Attendance Flexboard Flow

1. Teacher opens an attendance session detail page.
2. The page links to `/attendance/{id}/flexboard`.
3. Flexboard calls `GET /api/v1/attendance/sessions/{id}` and `GET /api/v1/attendance/records?session_id={id}`.
4. Attendance records include student name, title, and equipped character item codes.
5. The page auto-refreshes records and renders checked-in students as 2D character cards.

## Assignment Discussion Flow

1. User opens an assignment detail page.
2. Frontend calls `GET /api/v1/assignments/{id}/comments`.
3. Users can create comments and replies.
4. Comment authors can edit their own comments.
5. Authors, teachers, and admins can delete comments.

## Verification Summary

- Backend tests and build passed.
- Frontend type-check and production build passed.
- Local API smoke verified character equip, comments, and attendance records.
- Local browser smoke verified rendered wardrobe, flexboard, and discussion pages without HTTP or console errors after fixes.
