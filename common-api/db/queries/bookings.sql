-- name: ListBookings :many
SELECT id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at
FROM bookings
WHERE deleted_at IS NULL
    AND ($1::uuid IS NULL OR room_id = $1)
    AND ($2::timestamptz IS NULL OR start_time >= $2)
    AND ($3::timestamptz IS NULL OR end_time <= $3)
    AND ($4::text = '' OR status = $4)
    AND ($5::uuid IS NULL OR requester_id = $5)
ORDER BY start_time DESC
LIMIT $6 OFFSET $7;

-- name: GetBookingByID :one
SELECT id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at
FROM bookings
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateBooking :one
INSERT INTO bookings (room_id, requester_id, title, description, purpose, start_time, end_time)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at;

-- name: UpdateBooking :one
UPDATE bookings
SET
    title = COALESCE($2, title),
    description = COALESCE($3, description),
    purpose = COALESCE($4, purpose),
    start_time = COALESCE($5, start_time),
    end_time = COALESCE($6, end_time),
    updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at;

-- name: DeleteBooking :exec
UPDATE bookings SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;

-- name: ApproveBooking :one
UPDATE bookings
SET status = 'approved', approver_id = $2, approved_at = now(), updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at;

-- name: RejectBooking :one
UPDATE bookings
SET status = 'rejected', approver_id = $2, rejection_reason = $3, updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at;

-- name: CountOverlappingBookings :one
SELECT COUNT(*) as count
FROM bookings
WHERE room_id = $1
    AND deleted_at IS NULL
    AND status IN ('pending', 'approved')
    AND id != COALESCE($4, '00000000-0000-0000-0000-000000000000'::uuid)
    AND start_time < $3
    AND end_time > $2;
