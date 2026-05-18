package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type QuestHandler struct {
	service *service.QuestService
}

func NewQuestHandler(svc *service.QuestService) *QuestHandler {
	return &QuestHandler{service: svc}
}

func (h *QuestHandler) List(c *gin.Context) {
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

	quests, err := h.service.List(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, quests)
}

func (h *QuestHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid quest id")
		return
	}

	quest, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "quest")
		return
	}
	response.OK(c, quest)
}

func (h *QuestHandler) Create(c *gin.Context) {
	var req model.CreateQuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userIDStr, _ := c.Get("userID")
	teacherID, _ := uuid.Parse(userIDStr.(string))

	quest, err := h.service.Create(c.Request.Context(), teacherID, req)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, quest)
}

func (h *QuestHandler) Generate(c *gin.Context) {
	var req struct {
		Topic string `json:"topic" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userIDStr, _ := c.Get("userID")
	teacherID, _ := uuid.Parse(userIDStr.(string))

	quests, err := h.service.Generate(c.Request.Context(), req.Topic, teacherID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, quests)
}

func (h *QuestHandler) Submit(c *gin.Context) {
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

	var req model.SubmitQuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	questID, err := uuid.Parse(req.QuestID)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid quest id")
		return
	}

	attempt, err := h.service.Submit(c.Request.Context(), userID, questID, req.Answer)
	if err != nil {
		response.Conflict(c, "CONFLICT", err.Error())
		return
	}
	response.OK(c, attempt)
}
