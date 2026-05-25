package model

import (
	"time"

	"github.com/google/uuid"
)

type Grade struct {
	ID        uuid.UUID  `json:"id"`
	StudentID uuid.UUID  `json:"student_id"`
	ItemType  string     `json:"item_type"`
	ItemID    uuid.UUID  `json:"item_id"`
	Score     float64    `json:"score"`
	MaxScore  float64    `json:"max_score"`
	GradeCode *string    `json:"grade_code,omitempty"`
	Feedback  *string    `json:"feedback,omitempty"`
	GradedBy  *uuid.UUID `json:"graded_by,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type UpsertGradeRequest struct {
	StudentID string `json:"student_id" binding:"required,uuid"`
	ItemType  string `json:"item_type" binding:"required,oneof=assignment exam quiz participation"`
	ItemID    string `json:"item_id" binding:"required,uuid"`
	Score     int    `json:"score" binding:"required,min=0"`
	MaxScore  int    `json:"max_score" binding:"required,min=1"`
	GradeCode string `json:"grade_code,omitempty"`
	Feedback  string `json:"feedback,omitempty"`
}
