package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GradeHandler struct {
	service *service.GradeService
}

func NewGradeHandler(svc *service.GradeService) *GradeHandler {
	return &GradeHandler{service: svc}
}

func (h *GradeHandler) List(c *gin.Context) {
	var studentID *uuid.UUID
	if s := c.Query("student_id"); s != "" {
		id, err := uuid.Parse(s)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid student_id")
			return
		}
		studentID = &id
	}
	items, err := h.service.List(c.Request.Context(), studentID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *GradeHandler) Create(c *gin.Context) {
	var req model.UpsertGradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	item, err := h.service.Upsert(c.Request.Context(), req, userID.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *GradeHandler) Update(c *gin.Context) {
	var req model.UpsertGradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	item, err := h.service.Upsert(c.Request.Context(), req, userID.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}
