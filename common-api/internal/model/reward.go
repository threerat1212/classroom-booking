package model

import (
	"time"

	"github.com/google/uuid"
)

type RewardItem struct {
	ID               uuid.UUID `json:"id"`
	Code             string    `json:"code"`
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	Category         string    `json:"category"`
	RewardType       string    `json:"reward_type"`
	Icon             string    `json:"icon"`
	PriceGold        int       `json:"price_gold"`
	RequiredLevel    int       `json:"required_level"`
	StockLimit       *int      `json:"stock_limit,omitempty"`
	WeeklyLimit      *int      `json:"weekly_limit,omitempty"`
	MaxPerUser       *int      `json:"max_per_user,omitempty"`
	RequiresApproval bool      `json:"requires_approval"`
	IsActive         bool      `json:"is_active"`
	SortOrder        int       `json:"sort_order"`
	CreatedAt        time.Time `json:"created_at"`

	RedeemedCount    int     `json:"redeemed_count"`
	RedeemedThisWeek int     `json:"redeemed_this_week"`
	TotalRedemptions int     `json:"total_redemptions"`
	IsUnlocked       bool    `json:"is_unlocked"`
	CanRedeem        bool    `json:"can_redeem"`
	BlockedReason    *string `json:"blocked_reason,omitempty"`
}

type RewardRedemption struct {
	ID             uuid.UUID  `json:"id"`
	RewardID       uuid.UUID  `json:"reward_id"`
	UserID         uuid.UUID  `json:"user_id"`
	RewardCode     string     `json:"reward_code"`
	RewardName     string     `json:"reward_name"`
	RewardCategory string     `json:"reward_category"`
	StudentName    *string    `json:"student_name,omitempty"`
	StudentEmail   *string    `json:"student_email,omitempty"`
	GoldSpent      int        `json:"gold_spent"`
	Status         string     `json:"status"`
	Note           *string    `json:"note,omitempty"`
	RequestedAt    time.Time  `json:"requested_at"`
	ResolvedAt     *time.Time `json:"resolved_at,omitempty"`
	ResolvedBy     *uuid.UUID `json:"resolved_by,omitempty"`
}

type RewardShopSummary struct {
	GoldBalance int                 `json:"gold_balance"`
	Level       int                 `json:"level"`
	Rewards     []*RewardItem       `json:"rewards"`
	History     []*RewardRedemption `json:"history"`
}

type RedeemRewardRequest struct {
	RewardCode string `json:"reward_code" binding:"required"`
}

type RedeemRewardResponse struct {
	GoldBalance int               `json:"gold_balance"`
	Redemption  *RewardRedemption `json:"redemption"`
}

type UpdateRedemptionRequest struct {
	Status string `json:"status" binding:"required,oneof=pending approved rejected fulfilled used"`
	Note   string `json:"note,omitempty"`
}
