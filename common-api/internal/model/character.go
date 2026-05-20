package model

import (
	"time"

	"github.com/google/uuid"
)

type CharacterItem struct {
	Code              string    `json:"code"`
	Name              string    `json:"name"`
	Category          string    `json:"category"`
	SpriteURL         string    `json:"sprite_url"`
	Rarity            string    `json:"rarity"`
	RequiredLevel     int       `json:"required_level"`
	RequiredTitleCode *string   `json:"required_title_code,omitempty"`
	PriceGold         int       `json:"price_gold"`
	IsShopItem        bool      `json:"is_shop_item"`
	IsOwned           bool      `json:"is_owned"`
	IsLevelUnlocked   bool      `json:"is_level_unlocked"`
	CanPurchase       bool      `json:"can_purchase"`
	CreatedAt         time.Time `json:"created_at"`
	IsUnlocked        bool      `json:"is_unlocked"`
}

type UserCharacter struct {
	UserID         uuid.UUID         `json:"user_id"`
	EquippedHair   *string           `json:"equipped_hair,omitempty"`
	EquippedHat    *string           `json:"equipped_hat,omitempty"`
	EquippedOutfit *string           `json:"equipped_outfit,omitempty"`
	EquippedAura   *string           `json:"equipped_aura,omitempty"`
	EquippedItems  map[string]string `json:"equipped_items,omitempty"`
	UpdatedAt      time.Time         `json:"updated_at"`
}

type CharacterSummary struct {
	Character *UserCharacter   `json:"character"`
	Inventory []*CharacterItem `json:"inventory"`
	Gold      int              `json:"gold_balance"`
}

type EquipItemRequest struct {
	ItemCode string `json:"item_code" binding:"required"`
}

type EquipItemResponse struct {
	Character *UserCharacter `json:"character"`
}

type PurchaseItemRequest struct {
	ItemCode string `json:"item_code" binding:"required"`
}

type PurchaseItemResponse struct {
	Character *UserCharacter `json:"character"`
	Gold      int            `json:"gold_balance"`
	Item      *CharacterItem `json:"item"`
}
