package model

import (
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	Type      string     `json:"type"`
	Channel   string     `json:"channel"`
	ReadAt    *time.Time `json:"read_at,omitempty"`
	ActionURL *string    `json:"action_url,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type CreateNotificationRequest struct {
	UserID    string `json:"user_id" binding:"required,uuid"`
	Title     string `json:"title" binding:"required"`
	Message   string `json:"message" binding:"required"`
	Type      string `json:"type" binding:"required,oneof=info warning success error"`
	Channel   string `json:"channel" binding:"required,oneof=in_app line email"`
	ActionURL string `json:"action_url,omitempty"`
}
