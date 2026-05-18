package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RoomHandler struct {
	service *service.RoomService
}

func NewRoomHandler(svc *service.RoomService) *RoomHandler {
	return &RoomHandler{service: svc}
}

func (h *RoomHandler) List(c *gin.Context) {
	rooms, err := h.service.List(c.Request.Context())
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, rooms)
}

func (h *RoomHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid room id")
		return
	}
	room, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "room")
		return
	}
	response.OK(c, room)
}

func (h *RoomHandler) Create(c *gin.Context) {
	var req model.CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	room, err := h.service.Create(c.Request.Context(), req)
	if err != nil {
		response.Conflict(c, "CONFLICT", err.Error())
		return
	}
	response.Created(c, room)
}

func (h *RoomHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid room id")
		return
	}
	var req model.UpdateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	room, err := h.service.Update(c.Request.Context(), id, req)
	if err != nil {
		response.NotFound(c, "room")
		return
	}
	response.OK(c, room)
}

func (h *RoomHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid room id")
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.NotFound(c, "room")
		return
	}
	response.NoContent(c)
}
