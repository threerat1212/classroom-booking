package model

import (
	"time"

	"github.com/google/uuid"
)

type Booking struct {
	ID              uuid.UUID  `json:"id"`
	RoomID          uuid.UUID  `json:"room_id"`
	RequesterID     *uuid.UUID `json:"requester_id,omitempty"`
	ApproverID      *uuid.UUID `json:"approver_id,omitempty"`
	Title           string     `json:"title"`
	Description     *string    `json:"description,omitempty"`
	Purpose         string     `json:"purpose"`
	StartTime       time.Time  `json:"start_time"`
	EndTime         time.Time  `json:"end_time"`
	Status          string     `json:"status"`
	RejectionReason *string    `json:"rejection_reason,omitempty"`
	ApprovedAt      *time.Time `json:"approved_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	RequesterName   *string    `json:"requester_name,omitempty"`
	RequesterEmail  *string    `json:"requester_email,omitempty"`
	RequesterPhone  *string    `json:"requester_phone,omitempty"`
}

type CreateBookingRequest struct {
	RoomID      string    `json:"room_id" binding:"required,uuid"`
	Title       string    `json:"title" binding:"required"`
	Description *string   `json:"description,omitempty"`
	Purpose     string    `json:"purpose" binding:"required,oneof=class meeting exam event other"`
	StartTime   time.Time `json:"start_time" binding:"required"`
	EndTime     time.Time `json:"end_time" binding:"required,gtfield=StartTime"`
}

type PublicCreateBookingRequest struct {
	RoomID         string    `json:"room_id" binding:"required,uuid"`
	Title          string    `json:"title" binding:"required"`
	Description    *string   `json:"description,omitempty"`
	Purpose        string    `json:"purpose" binding:"required,oneof=class meeting exam event other"`
	StartTime      time.Time `json:"start_time" binding:"required"`
	EndTime        time.Time `json:"end_time" binding:"required,gtfield=StartTime"`
	RequesterName  string    `json:"requester_name" binding:"required"`
	RequesterEmail string    `json:"requester_email" binding:"required,email"`
	RequesterPhone string    `json:"requester_phone,omitempty"`
}

type UpdateBookingRequest struct {
	Title       *string    `json:"title,omitempty"`
	Description *string    `json:"description,omitempty"`
	Purpose     *string    `json:"purpose,omitempty" binding:"omitempty,oneof=class meeting exam event other"`
	StartTime   *time.Time `json:"start_time,omitempty"`
	EndTime     *time.Time `json:"end_time,omitempty" binding:"omitempty,gtfield=StartTime"`
}

type BookingListQuery struct {
	RoomID    string    `form:"room_id"`
	From      time.Time `form:"from" time_format:"2006-01-02T15:04:05Z07:00"`
	To        time.Time `form:"to" time_format:"2006-01-02T15:04:05Z07:00"`
	Status    string    `form:"status"`
	Requester string    `form:"requester_id"`
	Page      int32     `form:"page,default=1"`
	Limit     int32     `form:"limit,default=20"`
}
