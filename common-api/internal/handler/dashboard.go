package handler

import (
	"errors"

	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DashboardHandler struct {
	service *service.DashboardService
}

func NewDashboardHandler(svc *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: svc}
}

func (h *DashboardHandler) Community(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	dashboard, err := h.service.CommunityDashboard(c.Request.Context(), userID.(string), role.(string), c.Query("grade_level"))
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, "dashboard is not available for this grade level")
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, dashboard)
}

func (h *DashboardHandler) Classroom(c *gin.Context) {
	classroomID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid classroom id")
		return
	}
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	dashboard, err := h.service.ClassroomDashboard(c.Request.Context(), classroomID, userID.(string), role.(string))
	if errors.Is(err, model.ErrNotFound) {
		response.NotFound(c, "classroom")
		return
	}
	if errors.Is(err, model.ErrForbidden) {
		response.Forbidden(c, "dashboard is not available for this classroom")
		return
	}
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, dashboard)
}
