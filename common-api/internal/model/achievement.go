package model

import (
	"time"

	"github.com/google/uuid"
)

type LearningTitle struct {
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Rarity      string     `json:"rarity"`
	IsUnique    bool       `json:"is_unique"`
	IsUnlocked  bool       `json:"is_unlocked,omitempty"`
	IsEquipped  bool       `json:"is_equipped,omitempty"`
	AwardedAt   *time.Time `json:"awarded_at,omitempty"`
}

type LearningAchievement struct {
	Code        string         `json:"code"`
	TitleCode   *string        `json:"title_code,omitempty"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Rarity      string         `json:"rarity"`
	TriggerType string         `json:"trigger_type"`
	IsEarned    bool           `json:"is_earned"`
	EarnedAt    *time.Time     `json:"earned_at,omitempty"`
	Title       *LearningTitle `json:"title,omitempty"`
}

type AchievementSummary struct {
	Titles            []*LearningTitle       `json:"titles"`
	Achievements      []*LearningAchievement `json:"achievements"`
	EquippedTitle     *LearningTitle         `json:"equipped_title,omitempty"`
	SpecialQuestCount int                    `json:"special_quest_count"`
}

type EquipTitleResponse struct {
	RankTitle string         `json:"rank_title"`
	Title     *LearningTitle `json:"title"`
}

type UserAchievementAward struct {
	UserID          uuid.UUID `json:"user_id"`
	AchievementCode string    `json:"achievement_code"`
	TitleCode       *string   `json:"title_code,omitempty"`
	AwardedTitle    *string   `json:"awarded_title,omitempty"`
}
