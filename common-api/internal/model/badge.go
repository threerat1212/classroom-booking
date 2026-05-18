package model

import (
	"time"

	"github.com/google/uuid"
)

type Badge struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IconURL     *string   `json:"icon_url,omitempty"`
	Criteria    string    `json:"criteria"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateBadgeRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description,omitempty"`
	IconURL     string `json:"icon_url,omitempty"`
	Criteria    string `json:"criteria" binding:"required"`
}

type StudentBadge struct {
	ID        uuid.UUID  `json:"id"`
	StudentID uuid.UUID  `json:"student_id"`
	BadgeID   uuid.UUID  `json:"badge_id"`
	AwardedAt time.Time  `json:"awarded_at"`
	AwardedBy *uuid.UUID `json:"awarded_by,omitempty"`
	Context   *string    `json:"context,omitempty"`
}

type AwardBadgeRequest struct {
	StudentID string `json:"student_id" binding:"required,uuid"`
	BadgeID   string `json:"badge_id" binding:"required,uuid"`
	Context   string `json:"context,omitempty"`
}
