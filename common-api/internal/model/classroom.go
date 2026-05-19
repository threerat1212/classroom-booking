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

type LearningMaterial struct {
	ID           uuid.UUID `json:"id"`
	ClassroomID  uuid.UUID `json:"classroom_id"`
	TeacherID    uuid.UUID `json:"teacher_id"`
	Title        string    `json:"title"`
	Description  *string   `json:"description,omitempty"`
	MaterialType string    `json:"material_type"`
	Content      *string   `json:"content,omitempty"`
	URL          *string   `json:"url,omitempty"`
	FileURLs     []string  `json:"file_urls"`
	SortOrder    int       `json:"sort_order"`
	IsPublished  bool      `json:"is_published"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CreateClassroomRequest struct {
	Name        string  `json:"name" binding:"required"`
	Code        string  `json:"code,omitempty"`
	Capacity    int32   `json:"capacity" binding:"omitempty,min=1"`
	Description *string `json:"description,omitempty"`
}

type CreateLearningMaterialRequest struct {
	Title        string   `json:"title" binding:"required"`
	Description  string   `json:"description,omitempty"`
	MaterialType string   `json:"material_type" binding:"required,oneof=text file youtube link ai_summary"`
	Content      string   `json:"content,omitempty"`
	URL          string   `json:"url,omitempty"`
	FileURLs     []string `json:"file_urls,omitempty"`
	SortOrder    int      `json:"sort_order,omitempty"`
	IsPublished  *bool    `json:"is_published,omitempty"`
}

type JoinClassroomRequest struct {
	JoinCode string `json:"join_code" binding:"required"`
}
