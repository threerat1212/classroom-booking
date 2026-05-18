-- name: ListGrades :many
SELECT id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at
FROM grades
WHERE deleted_at IS NULL
    AND ($1::uuid IS NULL OR student_id = $1)
ORDER BY created_at DESC;

-- name: GetGradeByID :one
SELECT id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at
FROM grades
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpsertGrade :one
INSERT INTO grades (student_id, item_type, item_id, score, max_score, feedback, graded_by)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (student_id, item_type, item_id) DO UPDATE SET
    score = EXCLUDED.score,
    max_score = EXCLUDED.max_score,
    feedback = EXCLUDED.feedback,
    graded_by = EXCLUDED.graded_by,
    updated_at = now()
RETURNING id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at;

-- name: DeleteGrade :exec
UPDATE grades SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
