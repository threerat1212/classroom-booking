package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RewardHandler struct {
	service *service.RewardService
}

func NewRewardHandler(svc *service.RewardService) *RewardHandler {
	return &RewardHandler{service: svc}
}

func (h *RewardHandler) ListShop(c *gin.Context) {
	userID, err := currentUserID(c)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	summary, err := h.service.ListShop(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, summary)
}

func (h *RewardHandler) Redeem(c *gin.Context) {
	userID, err := currentUserID(c)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	var req model.RedeemRewardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	result, err := h.service.Redeem(c.Request.Context(), userID, req.RewardCode)
	if err != nil {
		switch err {
		case model.ErrNotFound:
			response.NotFound(c, "reward")
		case model.ErrForbidden:
			response.Forbidden(c, "reward is locked, limited, or gold is not enough")
		case model.ErrValidation:
			response.BadRequest(c, "VALIDATION_ERROR", "reward_code is required")
		default:
			response.InternalError(c, err.Error())
		}
		return
	}
	response.OK(c, result)
}

func (h *RewardHandler) ListRedemptions(c *gin.Context) {
	userID, err := currentUserID(c)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	role, _ := c.Get("role")
	items, err := h.service.ListRedemptions(c.Request.Context(), userID, role.(string), c.Query("status"))
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	response.OK(c, items)
}

func (h *RewardHandler) UpdateRedemption(c *gin.Context) {
	resolverID, err := currentUserID(c)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid redemption id")
		return
	}
	var req model.UpdateRedemptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}
	item, err := h.service.UpdateRedemption(c.Request.Context(), id, resolverID, req.Status, req.Note)
	if err != nil {
		switch err {
		case model.ErrNotFound:
			response.NotFound(c, "redemption")
		case model.ErrConflict:
			response.Conflict(c, "REDEMPTION_LOCKED", "rejected redemptions cannot be reopened")
		case model.ErrValidation:
			response.BadRequest(c, "VALIDATION_ERROR", "status is required")
		default:
			response.InternalError(c, err.Error())
		}
		return
	}
	response.OK(c, item)
}

func currentUserID(c *gin.Context) (uuid.UUID, error) {
	userID, _ := c.Get("userID")
	return uuid.Parse(userID.(string))
}
