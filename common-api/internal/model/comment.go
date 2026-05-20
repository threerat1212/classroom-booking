package model

import (
	"time"

	"github.com/google/uuid"
)

type Comment struct {
	ID           uuid.UUID  `json:"id"`
	AssignmentID uuid.UUID  `json:"assignment_id"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	AuthorID     uuid.UUID  `json:"author_id"`
	Content      string     `json:"content"`
	IsEdited     bool       `json:"is_edited"`
	EditedAt     *time.Time `json:"edited_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}

type CommentResponse struct {
	ID           uuid.UUID  `json:"id"`
	AssignmentID uuid.UUID  `json:"assignment_id"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	AuthorID     uuid.UUID  `json:"author_id"`
	AuthorName   string     `json:"author_name"`
	AuthorRole   string     `json:"author_role"`
	Content      string     `json:"content"`
	IsEdited     bool       `json:"is_edited"`
	EditedAt     *time.Time `json:"edited_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateCommentRequest struct {
	ParentID *string `json:"parent_id,omitempty"`
	Content  string  `json:"content" binding:"required"`
}

type UpdateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}
