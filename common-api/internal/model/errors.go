package model

import "errors"

var (
	ErrNotFound           = errors.New("not found")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrConflict           = errors.New("conflict")
	ErrValidation         = errors.New("validation")
	ErrInternal           = errors.New("internal error")
	ErrBookingOverlap     = errors.New("booking overlaps with existing reservation")
	ErrInvalidBookingTime = errors.New("booking end time must be after start time")
)
