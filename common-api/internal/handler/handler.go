package handler

import (
	"classroom-api/internal/service"
)

type Handlers struct {
	Auth         *AuthHandler
	User         *UserHandler
	Room         *RoomHandler
	Booking      *BookingHandler
	Assignment   *AssignmentHandler
	Submission   *SubmissionHandler
	Attendance   *AttendanceHandler
	Grade        *GradeHandler
	Notification *NotificationHandler
	Badge        *BadgeHandler
	Export       *ExportHandler
}

func NewHandlers(services *service.Services) *Handlers {
	return &Handlers{
		Auth:         NewAuthHandler(services.Auth, services.User),
		User:         NewUserHandler(services.User),
		Room:         NewRoomHandler(services.Room),
		Booking:      NewBookingHandler(services.Booking),
		Assignment:   NewAssignmentHandler(services.Assignment),
		Submission:   NewSubmissionHandler(services.Submission),
		Attendance:   NewAttendanceHandler(services.Attendance),
		Grade:        NewGradeHandler(services.Grade),
		Notification: NewNotificationHandler(services.Notification),
		Badge:        NewBadgeHandler(services.Badge),
		Export:       NewExportHandler(services.Export),
	}
}
