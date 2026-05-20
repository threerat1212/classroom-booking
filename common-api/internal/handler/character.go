package handler

import (
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CharacterHandler struct {
	service *service.CharacterService
}

func NewCharacterHandler(svc *service.CharacterService) *CharacterHandler {
	return &CharacterHandler{service: svc}
}

// GetSummary returns equipped configuration and item lists
func (h *CharacterHandler) GetSummary(c *gin.Context) {
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

	charSetup, err := h.service.GetCharacter(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}

	inventory, err := h.service.ListInventory(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}
	gold, err := h.service.GetGold(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}

	response.OK(c, &model.CharacterSummary{
		Character: charSetup,
		Inventory: inventory,
		Gold:      gold,
	})
}

// Equip equips a specific cosmetic item (hair, hat, outfit, aura)
func (h *CharacterHandler) Equip(c *gin.Context) {
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

	var req model.EquipItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	charSetup, err := h.service.EquipItem(c.Request.Context(), userID, req.ItemCode)
	if err != nil {
		if err == model.ErrForbidden {
			response.Forbidden(c, "item is locked")
			return
		}
		response.InternalError(c, err.Error())
		return
	}

	response.OK(c, &model.EquipItemResponse{
		Character: charSetup,
	})
}

// Purchase buys an available cosmetic item with quest-earned gold.
func (h *CharacterHandler) Purchase(c *gin.Context) {
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

	var req model.PurchaseItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	result, err := h.service.PurchaseItem(c.Request.Context(), userID, req.ItemCode)
	if err != nil {
		switch err {
		case model.ErrNotFound:
			response.NotFound(c, "item")
		case model.ErrConflict:
			response.Conflict(c, "ITEM_ALREADY_OWNED", "item is already owned")
		case model.ErrForbidden:
			response.Forbidden(c, "item is locked or gold is not enough")
		default:
			response.InternalError(c, err.Error())
		}
		return
	}

	response.OK(c, result)
}
