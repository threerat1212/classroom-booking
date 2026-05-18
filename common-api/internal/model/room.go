package model

import (
	"time"

	"github.com/google/uuid"
)

type Room struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	RoomType    string    `json:"room_type"`
	Capacity    int32     `json:"capacity"`
	Floor       *int32    `json:"floor,omitempty"`
	Building    *string   `json:"building,omitempty"`
	Description *string   `json:"description,omitempty"`
	Amenities   []string  `json:"amenities"`
	Status      string    `json:"status"`
	ImageURL    *string   `json:"image_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateRoomRequest struct {
	Name        string   `json:"name" binding:"required"`
	Code        string   `json:"code" binding:"required"`
	RoomType    string   `json:"room_type" binding:"required,oneof=classroom meeting_room lab auditorium"`
	Capacity    int32    `json:"capacity" binding:"required,min=1"`
	Floor       *int32   `json:"floor,omitempty"`
	Building    *string  `json:"building,omitempty"`
	Description *string  `json:"description,omitempty"`
	Amenities   []string `json:"amenities,omitempty"`
	Status      *string  `json:"status,omitempty" binding:"omitempty,oneof=available maintenance closed"`
}

type UpdateRoomRequest struct {
	Name        *string  `json:"name,omitempty"`
	Code        *string  `json:"code,omitempty"`
	RoomType    *string  `json:"room_type,omitempty" binding:"omitempty,oneof=classroom meeting_room lab auditorium"`
	Capacity    *int32   `json:"capacity,omitempty" binding:"omitempty,min=1"`
	Floor       *int32   `json:"floor,omitempty"`
	Building    *string  `json:"building,omitempty"`
	Description *string  `json:"description,omitempty"`
	Amenities   []string `json:"amenities,omitempty"`
	Status      *string  `json:"status,omitempty" binding:"omitempty,oneof=available maintenance closed"`
}
