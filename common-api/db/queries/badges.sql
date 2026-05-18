-- name: ListBadges :many
SELECT id, name, description, icon_url, criteria, created_at
FROM badges
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetBadgeByID :one
SELECT id, name, description, icon_url, criteria, created_at
FROM badges
WHERE id = $1 AND deleted_at IS NULL;

-- name: CreateBadge :one
INSERT INTO badges (name, description, icon_url, criteria)
VALUES ($1, $2, $3, $4)
RETURNING id, name, description, icon_url, criteria, created_at;

-- name: DeleteBadge :exec
UPDATE badges SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;

-- name: ListStudentBadges :many
SELECT sb.id, sb.student_id, sb.badge_id, sb.awarded_at, sb.awarded_by, sb.context
FROM student_badges sb
JOIN badges b ON b.id = sb.badge_id
WHERE sb.student_id = $1 AND b.deleted_at IS NULL
ORDER BY sb.awarded_at DESC;

-- name: AwardBadge :one
INSERT INTO student_badges (student_id, badge_id, awarded_by, context)
VALUES ($1, $2, $3, $4)
RETURNING id, student_id, badge_id, awarded_at, awarded_by, context;
