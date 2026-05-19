package handler

import (
	"errors"

	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ClassroomHandler struct {
	service *service.ClassroomService
}

func NewClassroomHandler(svc *service.ClassroomService) *ClassroomHandler {
	return &ClassroomHandler{service: svc}
}

func (h *ClassroomHandler) List(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	items, err := h.service.List(c.Request.Context(), userID.(string), role.(string))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *ClassroomHandler) Create(c *gin.Context) {
	var req model.CreateClassroomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userID, _ := c.Get("userID")
	item, err := h.service.Create(c.Request.Context(), req, userID.(string))
	if err != nil {
		response.Conflict(c, "CONFLICT", err.Error())
		return
	}
	response.Created(c, item)
}

func (h *ClassroomHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	item, err := h.service.Get(c.Request.Context(), id, userID.(string), role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
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
	response.OK(c, item)
}

func (h *ClassroomHandler) Join(c *gin.Context) {
	var req model.JoinClassroomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	userID, _ := c.Get("userID")
	item, err := h.service.Join(c.Request.Context(), userID.(string), req)
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, item)
}

func (h *ClassroomHandler) ListMaterials(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	items, err := h.service.ListMaterials(c.Request.Context(), id, userID.(string), role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
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
	response.OK(c, items)
}

func (h *ClassroomHandler) CreateMaterial(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}
	var req model.CreateLearningMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	item, err := h.service.CreateMaterial(c.Request.Context(), id, userID.(string), role.(string), req)
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
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

func (h *ClassroomHandler) DeleteMaterial(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}
	materialID, err := uuid.Parse(c.Param("materialID"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid material id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")
	err = h.service.DeleteMaterial(c.Request.Context(), id, materialID, userID.(string), role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "material")
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
	response.NoContent(c)
}
