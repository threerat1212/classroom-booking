package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AttendanceHandler struct {
	service *service.AttendanceService
}

func NewAttendanceHandler(svc *service.AttendanceService) *AttendanceHandler {
	return &AttendanceHandler{service: svc}
}

func (h *AttendanceHandler) ListSessions(c *gin.Context) {
	items, err := h.service.ListSessions(c.Request.Context())
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *AttendanceHandler) CreateSession(c *gin.Context) {
	var req model.CreateAttendanceSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	item, err := h.service.CreateSession(c.Request.Context(), req, userID.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *AttendanceHandler) ListRecords(c *gin.Context) {
	var sessionID, studentID *uuid.UUID
	if s := c.Query("session_id"); s != "" {
		id, err := uuid.Parse(s)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid session_id")
			return
		}
		sessionID = &id
	}
	if s := c.Query("student_id"); s != "" {
		id, err := uuid.Parse(s)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid student_id")
			return
		}
		studentID = &id
	}
	items, err := h.service.ListRecords(c.Request.Context(), sessionID, studentID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *AttendanceHandler) CreateRecord(c *gin.Context) {
	var req model.UpsertAttendanceRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	item, err := h.service.UpsertRecord(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *AttendanceHandler) UpdateRecord(c *gin.Context) {
	var req model.UpsertAttendanceRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	item, err := h.service.UpsertRecord(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}

func (h *AttendanceHandler) DeleteSession(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid session id")
		return
	}
	if err := h.service.DeleteSession(c.Request.Context(), id); err != nil {
		response.NotFound(c, "attendance session")
		return
	}
	response.NoContent(c)
}
