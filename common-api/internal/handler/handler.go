package handler

import (
	"classroom-api/internal/config"
	"classroom-api/internal/service"
)

type Handlers struct {
	Auth         *AuthHandler
	User         *UserHandler
	Room         *RoomHandler
	Classroom    *ClassroomHandler
	Booking      *BookingHandler
	Assignment   *AssignmentHandler
	Submission   *SubmissionHandler
	Attendance   *AttendanceHandler
	Grade        *GradeHandler
	Notification *NotificationHandler
	Badge        *BadgeHandler
	Export       *ExportHandler
	AI           *AIHandler
	Quest        *QuestHandler
	Achievement  *AchievementHandler
}

func NewHandlers(services *service.Services, cfg *config.Config) *Handlers {
	return &Handlers{
		Auth:         NewAuthHandler(services.Auth, services.User, cfg),
		User:         NewUserHandler(services.User),
		Room:         NewRoomHandler(services.Room),
		Classroom:    NewClassroomHandler(services.Classroom),
		Booking:      NewBookingHandler(services.Booking),
		Assignment:   NewAssignmentHandler(services.Assignment),
		Submission:   NewSubmissionHandler(services.Submission),
		Attendance:   NewAttendanceHandler(services.Attendance),
		Grade:        NewGradeHandler(services.Grade),
		Notification: NewNotificationHandler(services.Notification),
		Badge:        NewBadgeHandler(services.Badge),
		Export:       NewExportHandler(services.Export),
		AI:           NewAIHandler(services.AI),
		Quest:        NewQuestHandler(services.Quest),
		Achievement:  NewAchievementHandler(services.Achievement),
	}
}
