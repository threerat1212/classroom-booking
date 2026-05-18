package handler

import (
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BadgeHandler struct {
	service *service.BadgeService
}

func NewBadgeHandler(svc *service.BadgeService) *BadgeHandler {
	return &BadgeHandler{service: svc}
}

func (h *BadgeHandler) List(c *gin.Context) {
	items, err := h.service.List(c.Request.Context())
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *BadgeHandler) MyBadges(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	items, err := h.service.ListStudentBadges(c.Request.Context(), uid)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}
