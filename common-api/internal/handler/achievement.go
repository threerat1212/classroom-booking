package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AchievementHandler struct {
	service *service.AchievementService
}

func NewAchievementHandler(svc *service.AchievementService) *AchievementHandler {
	return &AchievementHandler{service: svc}
}

func (h *AchievementHandler) My(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "UNAUTHORIZED")
		return
	}
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}

	summary, err := h.service.Summary(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, summary)
}

func (h *AchievementHandler) ListTitles(c *gin.Context) {
	titles, err := h.service.ListTitles(c.Request.Context())
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, titles)
}

func (h *AchievementHandler) EquipTitle(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "UNAUTHORIZED")
		return
	}
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}

	titleCode := c.Param("code")
	result, err := h.service.EquipTitle(c.Request.Context(), userID, titleCode)
	if err != nil {
		if err == model.ErrForbidden {
			response.Forbidden(c, "title is not unlocked")
			return
		}
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, result)
}
