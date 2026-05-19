package model

import (
	"time"

	"github.com/google/uuid"
)

type Classroom struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Code         string     `json:"code"`
	Capacity     int32      `json:"capacity"`
	Description  *string    `json:"description,omitempty"`
	TeacherID    *uuid.UUID `json:"teacher_id,omitempty"`
	TeacherName  *string    `json:"teacher_name,omitempty"`
	JoinCode     *string    `json:"join_code,omitempty"`
	StudentCount int64      `json:"student_count"`
	JoinedAt     *time.Time `json:"joined_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type CreateClassroomRequest struct {
	Name        string  `json:"name" binding:"required"`
	Code        string  `json:"code,omitempty"`
	Capacity    int32   `json:"capacity" binding:"omitempty,min=1"`
	Description *string `json:"description,omitempty"`
}

type JoinClassroomRequest struct {
	JoinCode string `json:"join_code" binding:"required"`
}
