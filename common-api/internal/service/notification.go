package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationService struct {
	db *pgxpool.Pool
}

func NewNotificationService(db *pgxpool.Pool) *NotificationService {
	return &NotificationService{db: db}
}

func (s *NotificationService) List(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.Notification, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, user_id, title, message, type, channel, COALESCE(read_at, CASE WHEN is_read THEN created_at END), action_url, created_at
		 FROM notifications WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.Notification, 0)
	for rows.Next() {
		var n model.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.Channel, &n.ReadAt, &n.ActionURL, &n.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, &n)
	}
	return items, rows.Err()
}

func (s *NotificationService) Get(ctx context.Context, id, userID uuid.UUID) (*model.Notification, error) {
	var n model.Notification
	err := s.db.QueryRow(ctx,
		`SELECT id, user_id, title, message, type, channel, COALESCE(read_at, CASE WHEN is_read THEN created_at END), action_url, created_at
		 FROM notifications WHERE id = $1 AND user_id = $2`, id, userID,
	).Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.Channel, &n.ReadAt, &n.ActionURL, &n.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (s *NotificationService) Create(ctx context.Context, req model.CreateNotificationRequest) (*model.Notification, error) {
	uid, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, err
	}
	var n model.Notification
	err = s.db.QueryRow(ctx,
		`INSERT INTO notifications (user_id, title, message, type, channel, action_url)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, user_id, title, message, type, channel, read_at, action_url, created_at`,
		uid, req.Title, req.Message, req.Type, req.Channel, req.ActionURL,
	).Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.Channel, &n.ReadAt, &n.ActionURL, &n.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (s *NotificationService) MarkRead(ctx context.Context, id, userID uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE notifications SET is_read = true, read_at = COALESCE(read_at, now()) WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}

func (s *NotificationService) MarkAllRead(ctx context.Context, userID uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE notifications SET is_read = true, read_at = COALESCE(read_at, now()) WHERE user_id = $1 AND read_at IS NULL`, userID)
	return err
}
