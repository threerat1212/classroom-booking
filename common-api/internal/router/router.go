package router

import (
	"classroom-api/internal/config"
	"classroom-api/internal/handler"
	"classroom-api/internal/middleware"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
)

func New(cfg *config.Config, h *handler.Handlers) *gin.Engine {
	r := gin.New()

	r.Use(middleware.RecoveryMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())

	r.GET("/health", func(c *gin.Context) {
		response.OK(c, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")

	auth := api.Group("/auth")
	{
		auth.POST("/login", h.Auth.Login)
		auth.POST("/register", h.Auth.Register)
		auth.POST("/google-login", h.Auth.GoogleLogin)
		auth.POST("/refresh", h.Auth.Refresh)
		auth.POST("/logout", h.Auth.Logout)
	}

	public := api.Group("/public")
	{
		public.GET("/rooms", h.Room.List)
		public.POST("/bookings", h.Booking.PublicCreate)
	}

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		users := protected.Group("/users")
		users.Use(middleware.RequireRoles("admin", "teacher"))
		{
			users.GET("", h.User.List)
			users.GET("/:id", h.User.Get)
			users.POST("", middleware.RequireRoles("admin"), h.User.Create)
			users.PUT("/:id", middleware.RequireRoles("admin"), h.User.Update)
			users.DELETE("/:id", middleware.RequireRoles("admin"), h.User.Delete)
		}

		rooms := protected.Group("/rooms")
		{
			rooms.GET("", h.Room.List)
			rooms.GET("/:id", h.Room.Get)
			rooms.POST("", middleware.RequireRoles("admin"), h.Room.Create)
			rooms.PUT("/:id", middleware.RequireRoles("admin"), h.Room.Update)
			rooms.DELETE("/:id", middleware.RequireRoles("admin"), h.Room.Delete)
		}

		bookings := protected.Group("/bookings")
		{
			bookings.GET("", h.Booking.List)
			bookings.GET("/:id", h.Booking.Get)
			bookings.POST("", h.Booking.Create)
			bookings.PUT("/:id", h.Booking.Update)
			bookings.DELETE("/:id", h.Booking.Delete)
			bookings.PATCH("/:id/approve", middleware.RequireRoles("admin"), h.Booking.Approve)
			bookings.PATCH("/:id/reject", middleware.RequireRoles("admin"), h.Booking.Reject)
		}

		assignments := protected.Group("/assignments")
		{
			assignments.GET("", h.Assignment.List)
			assignments.GET("/:id", h.Assignment.Get)
			assignments.POST("", middleware.RequireRoles("teacher", "admin"), h.Assignment.Create)
			assignments.PUT("/:id", middleware.RequireRoles("teacher", "admin"), h.Assignment.Update)
			assignments.DELETE("/:id", middleware.RequireRoles("teacher", "admin"), h.Assignment.Delete)
		}

		submissions := protected.Group("/submissions")
		{
			submissions.GET("", h.Submission.List)
			submissions.GET("/:id", h.Submission.Get)
			submissions.POST("", middleware.RequireRoles("student"), h.Submission.Create)
			submissions.PUT("/:id", middleware.RequireRoles("student"), h.Submission.Update)
			submissions.PATCH("/:id/grade", middleware.RequireRoles("teacher", "admin"), h.Submission.Grade)
		}

		attendance := protected.Group("/attendance")
		{
			attendance.GET("/sessions", h.Attendance.ListSessions)
			attendance.POST("/sessions", middleware.RequireRoles("teacher", "admin"), h.Attendance.CreateSession)
			attendance.DELETE("/sessions/:id", middleware.RequireRoles("teacher", "admin"), h.Attendance.DeleteSession)
			attendance.GET("/records", h.Attendance.ListRecords)
			attendance.POST("/records", middleware.RequireRoles("teacher", "admin"), h.Attendance.CreateRecord)
			attendance.PUT("/records/:id", middleware.RequireRoles("teacher", "admin"), h.Attendance.UpdateRecord)
		}

		grades := protected.Group("/grades")
		{
			grades.GET("", h.Grade.List)
			grades.POST("", middleware.RequireRoles("teacher", "admin"), h.Grade.Create)
			grades.PUT("/:id", middleware.RequireRoles("teacher", "admin"), h.Grade.Update)
		}

		notifications := protected.Group("/notifications")
		{
			notifications.GET("", h.Notification.List)
			notifications.PATCH("/:id/read", h.Notification.MarkRead)
			notifications.PATCH("/read-all", h.Notification.MarkAllRead)
		}

		badges := protected.Group("/badges")
		{
			badges.GET("", h.Badge.List)
			badges.GET("/my", h.Badge.MyBadges)
		}

		protected.GET("/leaderboard", h.User.Leaderboard)

		protected.GET("/export/attendance", middleware.RequireRoles("teacher", "admin"), h.Export.Attendance)
		protected.GET("/export/grades", middleware.RequireRoles("teacher", "admin"), h.Export.Grades)
	}

	return r
}
