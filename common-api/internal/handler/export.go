package handler

import (
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ExportHandler struct {
	service *service.ExportService
}

func NewExportHandler(svc *service.ExportService) *ExportHandler {
	return &ExportHandler{service: svc}
}

func (h *ExportHandler) Attendance(c *gin.Context) {
	var roomID uuid.UUID
	if r := c.Query("room_id"); r != "" {
		parsed, err := uuid.Parse(r)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid room_id")
			return
		}
		roomID = parsed
	}
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=attendance.csv")
	_ = h.service.ExportAttendanceCSV(c.Request.Context(), roomID, c.Writer)
}

func (h *ExportHandler) Grades(c *gin.Context) {
	var studentID uuid.UUID
	if s := c.Query("student_id"); s != "" {
		parsed, err := uuid.Parse(s)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid student_id")
			return
		}
		studentID = parsed
	}
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=grades.csv")
	_ = h.service.ExportGradesCSV(c.Request.Context(), studentID, c.Writer)
}
