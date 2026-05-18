-- name: ListSubmissions :many
SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at
FROM submissions
WHERE deleted_at IS NULL
    AND ($1::uuid IS NULL OR assignment_id = $1)
    AND ($2::uuid IS NULL OR student_id = $2)
ORDER BY submitted_at DESC;

-- name: GetSubmissionByID :one
SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at
FROM submissions
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateSubmission :one
INSERT INTO submissions (assignment_id, student_id, content, file_urls, external_link)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at;

-- name: UpdateSubmission :one
UPDATE submissions
SET
    content = COALESCE($2, content),
    file_urls = COALESCE($3, file_urls),
    external_link = COALESCE($4, external_link),
    updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at;

-- name: GradeSubmission :one
UPDATE submissions
SET
    score = $2,
    feedback = $3,
    graded_by = $4,
    graded_at = now(),
    status = 'graded',
    updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at;

-- name: DeleteSubmission :exec
UPDATE submissions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
