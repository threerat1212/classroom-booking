-- name: ListAttendance :many
SELECT id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at
FROM attendance_sessions
WHERE deleted_at IS NULL
ORDER BY session_date DESC;

-- name: GetAttendanceSessionByID :one
SELECT id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at
FROM attendance_sessions
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateAttendanceSession :one
INSERT INTO attendance_sessions (room_id, teacher_id, session_date, start_time, end_time, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at;

-- name: DeleteAttendanceSession :exec
UPDATE attendance_sessions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;

-- name: ListAttendanceRecords :many
SELECT id, session_id, student_id, status, check_in_time, check_out_time, notes, created_at, updated_at
FROM attendance_records
WHERE deleted_at IS NULL
    AND ($1::uuid IS NULL OR session_id = $1)
    AND ($2::uuid IS NULL OR student_id = $2)
ORDER BY created_at DESC;

-- name: UpsertAttendanceRecord :one
INSERT INTO attendance_records (session_id, student_id, status, check_in_time, notes)
VALUES ($1, $2, $3, COALESCE($4, now()), $5)
ON CONFLICT (session_id, student_id) DO UPDATE SET
    status = EXCLUDED.status,
    check_in_time = COALESCE(EXCLUDED.check_in_time, attendance_records.check_in_time),
    notes = EXCLUDED.notes,
    updated_at = now()
RETURNING id, session_id, student_id, status, check_in_time, check_out_time, notes, created_at, updated_at;
