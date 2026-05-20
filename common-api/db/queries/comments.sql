-- name: ListCommentsByAssignment :many
SELECT
    c.id,
    c.assignment_id,
    c.parent_id,
    c.author_id,
    c.content,
    c.is_edited,
    c.edited_at,
    c.created_at,
    c.updated_at,
    u.full_name AS author_name,
    u.role AS author_role
FROM comments c
JOIN users u ON c.author_id = u.id
WHERE c.assignment_id = $1 AND c.deleted_at IS NULL
ORDER BY c.created_at ASC;

-- name: CreateComment :one
INSERT INTO comments (
    assignment_id,
    parent_id,
    author_id,
    content
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetComment :one
SELECT * FROM comments
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateComment :one
UPDATE comments
SET
    content = $1,
    is_edited = true,
    edited_at = now(),
    updated_at = now()
WHERE id = $2 AND author_id = $3 AND deleted_at IS NULL
RETURNING *;

-- name: DeleteComment :one
UPDATE comments
SET deleted_at = now(), updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;
