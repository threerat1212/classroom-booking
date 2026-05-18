package handler

import (
	"strconv"

	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	service *service.NotificationService
}

func NewNotificationHandler(svc *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: svc}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}
	items, err := h.service.List(c.Request.Context(), uid, limit, offset)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid notification id")
		return
	}
	userID, _ := c.Get("userID")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	if err := h.service.MarkRead(c.Request.Context(), id, uid); err != nil {
		response.NotFound(c, "notification")
		return
	}
	response.NoContent(c)
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	if err := h.service.MarkAllRead(c.Request.Context(), uid); err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.NoContent(c)
}
