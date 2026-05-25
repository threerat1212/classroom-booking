package model

import (
	"time"

	"github.com/google/uuid"
)

type Submission struct {
	ID           uuid.UUID  `json:"id"`
	AssignmentID uuid.UUID  `json:"assignment_id"`
	StudentID    uuid.UUID  `json:"student_id"`
	Content      *string    `json:"content,omitempty"`
	FileURLs     []string   `json:"file_urls,omitempty"`
	ExternalLink *string    `json:"external_link,omitempty"`
	SubmittedAt  *time.Time `json:"submitted_at,omitempty"`
	Status       string     `json:"status"`
	Score        *int       `json:"score,omitempty"`
	GradeCode    *string    `json:"grade_code,omitempty"`
	Feedback     *string    `json:"feedback,omitempty"`
	GradedBy     *uuid.UUID `json:"graded_by,omitempty"`
	GradedAt     *time.Time `json:"graded_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateSubmissionRequest struct {
	AssignmentID string   `json:"assignment_id" binding:"required,uuid"`
	Content      string   `json:"content,omitempty"`
	FileURLs     []string `json:"file_urls,omitempty"`
	ExternalLink string   `json:"external_link,omitempty"`
}

type UpdateSubmissionRequest struct {
	Content      *string  `json:"content,omitempty"`
	FileURLs     []string `json:"file_urls,omitempty"`
	ExternalLink *string  `json:"external_link,omitempty"`
}

type GradeSubmissionRequest struct {
	Score     int     `json:"score" binding:"min=0"`
	Feedback  string  `json:"feedback,omitempty"`
	GradeCode *string `json:"grade_code,omitempty"`
}
