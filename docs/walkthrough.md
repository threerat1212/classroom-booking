# Walkthrough

Date: 2026-05-23

## Student Reward Shop Flow

1. Student opens `Reward Shop` from the sidebar.
2. Frontend calls `GET /api/v1/rewards`.
3. Backend returns the student's level, current Gold balance, available reward items, limits, and recent redemption history.
4. Student redeems an unlocked reward through `POST /api/v1/rewards/redeem`.
5. Rewards that affect classroom privileges or deadlines enter a teacher approval queue before use.
6. Recognition rewards use `Quest Arc` wording for a short 2-4 week learning unit, not a full term.

## Title Unlock Flow

1. Student completes learning quest work.
2. Achievement service awards eligible titles.
3. Earned titles continue to support identity and leaderboard recognition.
4. Quest Gold is the spendable economy used in the Reward Shop.

## Attendance Flexboard Flow

1. Teacher opens an attendance session detail page.
2. The page links to `/attendance/{id}/flexboard`.
3. Flexboard calls `GET /api/v1/attendance/sessions/{id}` and `GET /api/v1/attendance/records?session_id={id}`.
4. Attendance records include student name, title, and attendance status.
5. The page auto-refreshes records and renders checked-in students as a projector-friendly live roster.

## Assignment Discussion Flow

1. User opens an assignment detail page.
2. Frontend calls `GET /api/v1/assignments/{id}/comments`.
3. Users can create comments and replies.
4. Comment authors can edit their own comments.
5. Authors, teachers, and admins can delete comments.

## Assignment File Submission Flow

1. Student opens an assignment submission page.
2. Student uploads PDF, Word, PowerPoint, Excel, text, or image files through `POST /api/v1/uploads`.
3. Backend stores the file through the configured storage provider and returns a protected download URL.
4. Student submits the assignment with uploaded file URLs in `file_urls`.
5. Teacher opens the assignment gradebook and can open submitted files from the `Work` column through a signed access URL.

## Production File Storage Flow

1. Local development uses `STORAGE_PROVIDER=local` and stores files under `UPLOAD_DIR`.
2. Render production uses `STORAGE_PROVIDER=r2`.
3. The API uploads files to Cloudflare R2 through the S3-compatible API.
4. File links saved in submissions and learning materials point to `/api/v1/uploads/{id}/download`.
5. The frontend resolves each saved file link through `/api/v1/uploads/{id}/access` before opening it.
6. R2 files are opened with short-lived signed URLs controlled by `R2_PRESIGN_TTL_SECONDS`.

## Verification Summary

- Backend tests and build passed.
- Frontend type-check and production build passed.
- Local API smoke verified rewards, comments, and attendance records.
- Local browser smoke verified rendered Reward Shop, flexboard, and discussion pages without HTTP or console errors after fixes.
