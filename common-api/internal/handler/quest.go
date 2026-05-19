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

	role, _ := c.Get("role")
	roleStr, _ := role.(string)

	quests, err := h.service.List(c.Request.Context(), userID, roleStr)
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
	role, _ := c.Get("role")
	roleStr, _ := role.(string)

	quest, err := h.service.GetForUser(c.Request.Context(), id, userID, roleStr)
	if err != nil {
		if err == model.ErrForbidden {
			response.Forbidden(c, "quest is locked or not available")
			return
		}
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
	var req model.GenerateQuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	classroomID, err := uuid.Parse(req.ClassroomID)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}

	userIDStr, _ := c.Get("userID")
	teacherID, _ := uuid.Parse(userIDStr.(string))

	quests, err := h.service.Generate(c.Request.Context(), req.Topic, teacherID, classroomID)
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
		if err == model.ErrForbidden {
			response.Forbidden(c, "quest is locked or not available")
			return
		}
		response.Conflict(c, "CONFLICT", err.Error())
		return
	}
	response.OK(c, attempt)
}
