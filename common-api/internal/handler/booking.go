package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookingHandler struct {
	service *service.BookingService
}

func NewBookingHandler(svc *service.BookingService) *BookingHandler {
	return &BookingHandler{service: svc}
}

func (h *BookingHandler) List(c *gin.Context) {
	var q model.BookingListQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	bookings, err := h.service.List(c.Request.Context(), q)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, bookings)
}

func (h *BookingHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid booking id")
		return
	}
	booking, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "booking")
		return
	}
	response.OK(c, booking)
}

func (h *BookingHandler) Create(c *gin.Context) {
	var req model.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	requesterID, _ := c.Get("userID")
	booking, err := h.service.Create(c.Request.Context(), req, requesterID.(string))
	if err != nil {
		if err == model.ErrBookingOverlap {
			response.Conflict(c, "BOOKING_OVERLAP", "The requested time overlaps with an existing booking")
			return
		}
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, booking)
}

func (h *BookingHandler) PublicCreate(c *gin.Context) {
	var req model.PublicCreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	booking, err := h.service.PublicCreate(c.Request.Context(), req)
	if err != nil {
		if err == model.ErrBookingOverlap {
			response.Conflict(c, "BOOKING_OVERLAP", "The requested time overlaps with an existing booking")
			return
		}
		response.InternalError(c, err.Error())
		return
	}
	response.Created(c, booking)
}

func (h *BookingHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid booking id")
		return
	}
	var req model.UpdateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	booking, err := h.service.Update(c.Request.Context(), id, req)
	if err != nil {
		response.NotFound(c, "booking")
		return
	}
	response.OK(c, booking)
}

func (h *BookingHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid booking id")
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.NotFound(c, "booking")
		return
	}
	response.NoContent(c)
}

func (h *BookingHandler) Approve(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid booking id")
		return
	}
	approverID, _ := c.Get("userID")
	if err := h.service.Approve(c.Request.Context(), id, approverID.(string)); err != nil {
		response.NotFound(c, "booking")
		return
	}
	response.NoContent(c)
}

func (h *BookingHandler) Reject(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid booking id")
		return
	}
	var body struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	approverID, _ := c.Get("userID")
	if err := h.service.Reject(c.Request.Context(), id, approverID.(string), body.Reason); err != nil {
		response.NotFound(c, "booking")
		return
	}
	response.NoContent(c)
}
