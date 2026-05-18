package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SubmissionHandler struct {
	service *service.SubmissionService
}

func NewSubmissionHandler(svc *service.SubmissionService) *SubmissionHandler {
	return &SubmissionHandler{service: svc}
}

func (h *SubmissionHandler) List(c *gin.Context) {
	var assignmentID, studentID *uuid.UUID
	if a := c.Query("assignment_id"); a != "" {
		id, err := uuid.Parse(a)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment_id")
			return
		}
		assignmentID = &id
	}
	if s := c.Query("student_id"); s != "" {
		id, err := uuid.Parse(s)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid student_id")
			return
		}
		studentID = &id
	}
	items, err := h.service.List(c.Request.Context(), assignmentID, studentID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *SubmissionHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid submission id")
		return
	}
	item, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "submission")
		return
	}
	response.OK(c, item)
}

func (h *SubmissionHandler) Create(c *gin.Context) {
	var req model.CreateSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	item, err := h.service.Create(c.Request.Context(), req, userID.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *SubmissionHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid submission id")
		return
	}
	var req model.UpdateSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, req)
	if err != nil {
		response.NotFound(c, "submission")
		return
	}
	response.OK(c, item)
}

func (h *SubmissionHandler) Grade(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid submission id")
		return
	}
	var req model.GradeSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	item, err := h.service.Grade(c.Request.Context(), id, req, userID.(string))
	if err != nil {
		response.NotFound(c, "submission")
		return
	}
	response.OK(c, item)
}
