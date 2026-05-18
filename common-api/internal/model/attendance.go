package model

import (
	"time"

	"github.com/google/uuid"
)

type AttendanceSession struct {
	ID         uuid.UUID  `json:"id"`
	RoomID     uuid.UUID  `json:"room_id"`
	TeacherID  uuid.UUID  `json:"teacher_id"`
	SessionDate time.Time `json:"session_date"`
	StartTime  time.Time  `json:"start_time"`
	EndTime    time.Time  `json:"end_time"`
	Status     string     `json:"status"`
	QRCode     *string    `json:"qr_code,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type CreateAttendanceSessionRequest struct {
	RoomID      string `json:"room_id" binding:"required,uuid"`
	Title       string `json:"title,omitempty"`
	SessionDate string `json:"session_date" binding:"required"`
	StartTime   string `json:"start_time" binding:"required"`
	EndTime     string `json:"end_time" binding:"required"`
	Status      string `json:"status" binding:"required,oneof=open closed cancelled"`
}

type AttendanceRecord struct {
	ID           uuid.UUID  `json:"id"`
	SessionID    uuid.UUID  `json:"session_id"`
	StudentID    uuid.UUID  `json:"student_id"`
	Status       string     `json:"status"`
	CheckInTime  *time.Time `json:"check_in_time,omitempty"`
	CheckOutTime *time.Time `json:"check_out_time,omitempty"`
	Notes        *string    `json:"notes,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type UpsertAttendanceRecordRequest struct {
	SessionID string `json:"session_id" binding:"required,uuid"`
	StudentID string `json:"student_id" binding:"required,uuid"`
	Status    string `json:"status" binding:"required,oneof=present late leave absent"`
	Notes     string `json:"notes,omitempty"`
}
