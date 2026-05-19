package model

import (
	"time"

	"github.com/google/uuid"
)

type Assignment struct {
	ID             uuid.UUID  `json:"id"`
	TeacherID      uuid.UUID  `json:"teacher_id"`
	RoomID         *uuid.UUID `json:"room_id,omitempty"`
	Title          string     `json:"title"`
	Description    *string    `json:"description,omitempty"`
	AssignmentType string     `json:"assignment_type"`
	MaxScore       *int       `json:"max_score,omitempty"`
	DueDate        *time.Time `json:"due_date,omitempty"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type AssignmentGradebookRow struct {
	StudentID    uuid.UUID  `json:"student_id"`
	StudentName  string     `json:"student_name"`
	StudentEmail string     `json:"student_email"`
	SubmissionID *uuid.UUID `json:"submission_id,omitempty"`
	Status       string     `json:"status"`
	Score        *int       `json:"score,omitempty"`
	MaxScore     int        `json:"max_score"`
	Percent      *float64   `json:"percent,omitempty"`
	GradeCode    string     `json:"grade_code"`
	Feedback     *string    `json:"feedback,omitempty"`
	SubmittedAt  *time.Time `json:"submitted_at,omitempty"`
	GradedAt     *time.Time `json:"graded_at,omitempty"`
}

type CreateAssignmentRequest struct {
	RoomID         *string `json:"room_id,omitempty"`
	Title          string  `json:"title" binding:"required"`
	Description    string  `json:"description,omitempty"`
	AssignmentType string  `json:"assignment_type" binding:"required,oneof=individual group"`
	MaxScore       *int    `json:"max_score,omitempty"`
	DueDate        *string `json:"due_date,omitempty"`
	Status         string  `json:"status" binding:"required,oneof=draft published closed"`
}

type UpdateAssignmentRequest struct {
	RoomID         *string `json:"room_id,omitempty"`
	Title          *string `json:"title,omitempty"`
	Description    *string `json:"description,omitempty"`
	AssignmentType *string `json:"assignment_type,omitempty" binding:"omitempty,oneof=individual group"`
	MaxScore       *int    `json:"max_score,omitempty"`
	DueDate        *string `json:"due_date,omitempty"`
	Status         *string `json:"status,omitempty" binding:"omitempty,oneof=draft published closed"`
}
