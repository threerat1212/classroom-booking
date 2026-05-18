-- name: ListNotifications :many
SELECT id, user_id, title, message, type, channel, read_at, action_url, created_at
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetNotificationByID :one
SELECT id, user_id, title, message, type, channel, read_at, action_url, created_at
FROM notifications
WHERE id = $1 AND user_id = $2;

-- name: CreateNotification :one
INSERT INTO notifications (user_id, title, message, type, channel, action_url)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, user_id, title, message, type, channel, read_at, action_url, created_at;

-- name: MarkNotificationRead :exec
UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2;

-- name: MarkAllNotificationsRead :exec
UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL;
