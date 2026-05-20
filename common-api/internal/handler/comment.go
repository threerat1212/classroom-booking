package handler

import (
	"errors"

	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CommentHandler struct {
	service *service.CommentService
}

func NewCommentHandler(svc *service.CommentService) *CommentHandler {
	return &CommentHandler{service: svc}
}

func (h *CommentHandler) ListByAssignment(c *gin.Context) {
	assignmentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}

	items, err := h.service.ListByAssignment(c.Request.Context(), assignmentID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *CommentHandler) Create(c *gin.Context) {
	assignmentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid assignment id")
		return
	}

	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userIDStr, _ := c.Get("userID")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.InternalError(c, "invalid user id in context")
		return
	}

	item, err := h.service.Create(c.Request.Context(), assignmentID, userID, req)
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "assignment")
		return
	}
	if errors.Is(err, model.ErrValidation) {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, item)
}

func (h *CommentHandler) Update(c *gin.Context) {
	commentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid comment id")
		return
	}

	var req model.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userIDStr, _ := c.Get("userID")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.InternalError(c, "invalid user id in context")
		return
	}

	item, err := h.service.Update(c.Request.Context(), commentID, userID, req)
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "comment")
		return
	}
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, "you cannot modify this comment")
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}

func (h *CommentHandler) Delete(c *gin.Context) {
	commentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid comment id")
		return
	}

	userIDStr, _ := c.Get("userID")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.InternalError(c, "invalid user id in context")
		return
	}

	role, _ := c.Get("role")

	err = h.service.Delete(c.Request.Context(), commentID, userID, role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "comment")
		return
	}
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, "you do not have permission to delete this comment")
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.NoContent(c)
}
