package handler

import (
	"bytes"
	"errors"
	"fmt"
	"strings"

	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AssignmentHandler struct {
	service *service.AssignmentService
}

func NewAssignmentHandler(svc *service.AssignmentService) *AssignmentHandler {
	return &AssignmentHandler{service: svc}
}

func (h *AssignmentHandler) List(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	items, err := h.service.List(c.Request.Context(), userID.(string), role.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *AssignmentHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}
	item, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "assignment")
		return
	}
	response.OK(c, item)
}

func (h *AssignmentHandler) Create(c *gin.Context) {
	var req model.CreateAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	item, err := h.service.Create(c.Request.Context(), req, userID.(string), role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
		return
	}
	if errors.Is(err, model.ErrValidation) {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, err.Error())
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *AssignmentHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}
	var req model.UpdateAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, req)
	if err != nil {
		response.NotFound(c, "assignment")
		return
	}
	response.OK(c, item)
}

func (h *AssignmentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.NotFound(c, "assignment")
		return
	}
	response.NoContent(c)
}

func (h *AssignmentHandler) Gradebook(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	rows, err := h.service.Gradebook(c.Request.Context(), id, userID.(string), role.(string))
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, err.Error())
		return
	}
	if err != nil {
		response.NotFound(c, "assignment")
		return
	}
	response.OK(c, rows)
}

func (h *AssignmentHandler) ExportGradebook(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	var buf bytes.Buffer
	if err := h.service.ExportGradebookXLSX(c.Request.Context(), id, userID.(string), role.(string), &buf); err != nil {
		if errors.Is(err, model.ErrForbidden) {
			response.Forbidden(c, err.Error())
			return
		}
		response.InternalError(c, err.Error())
		return
	}
	filename := fmt.Sprintf("assignment-%s-gradebook.xlsx", strings.ReplaceAll(id.String(), "-", ""))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	_, _ = c.Writer.Write(buf.Bytes())
}
