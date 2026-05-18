-- name: ListAssignments :many
SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
FROM assignments
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetAssignmentByID :one
SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
FROM assignments
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateAssignment :one
INSERT INTO assignments (teacher_id, room_id, title, description, assignment_type, max_score, due_date, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at;

-- name: UpdateAssignment :one
UPDATE assignments
SET
    room_id = COALESCE($2, room_id),
    title = COALESCE($3, title),
    description = COALESCE($4, description),
    assignment_type = COALESCE($5, assignment_type),
    max_score = COALESCE($6, max_score),
    due_date = COALESCE($7, due_date),
    status = COALESCE($8, status),
    updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at;

-- name: DeleteAssignment :exec
UPDATE assignments SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
