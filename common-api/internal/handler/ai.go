package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AIHandler struct {
	service *service.AIService
}

func NewAIHandler(svc *service.AIService) *AIHandler {
	return &AIHandler{service: svc}
}

func (h *AIHandler) Chat(c *gin.Context) {
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

	var req model.AIChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	res, err := h.service.Chat(c.Request.Context(), userID, req.SessionID, req.Message)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, res)
}

func (h *AIHandler) ListSessions(c *gin.Context) {
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

	sessions, err := h.service.ListSessions(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, sessions)
}

func (h *AIHandler) ListMessages(c *gin.Context) {
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

	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid session id")
		return
	}

	messages, err := h.service.ListMessages(c.Request.Context(), sessionID, userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, messages)
}
