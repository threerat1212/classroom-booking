package model

import (
	"time"

	"github.com/google/uuid"
)

type LearningQuest struct {
	ID                uuid.UUID  `json:"id"`
	TeacherID         uuid.UUID  `json:"teacher_id"`
	ClassroomID       *uuid.UUID `json:"classroom_id,omitempty"`
	ClassroomName     *string    `json:"classroom_name,omitempty"`
	Title             string     `json:"title"`
	Topic             string     `json:"topic"`
	Description       string     `json:"description"`
	Difficulty        string     `json:"difficulty"`
	Question          string     `json:"question"`
	Answer            *string    `json:"answer,omitempty"`
	Hints             []string   `json:"hints"`
	Explanation       *string    `json:"explanation,omitempty"`
	ExpReward         int        `json:"exp_reward"`
	GoldReward        int        `json:"gold_reward"`
	TimeLimitMinutes  *int       `json:"time_limit_minutes,omitempty"`
	Status            string     `json:"status"`
	QuestKind         string     `json:"quest_kind"`
	RequiredTitleCode *string    `json:"required_title_code,omitempty"`
	RequiredTitleName *string    `json:"required_title_name,omitempty"`
	UnlockNote        *string    `json:"unlock_note,omitempty"`
	IsLocked          bool       `json:"is_locked,omitempty"`
	LockedReason      *string    `json:"locked_reason,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	IsCompleted       bool       `json:"is_completed,omitempty"`
}

type QuestAttempt struct {
	ID          uuid.UUID  `json:"id"`
	QuestID     uuid.UUID  `json:"quest_id"`
	StudentID   uuid.UUID  `json:"student_id"`
	Answer      *string    `json:"answer,omitempty"`
	IsCorrect   *bool      `json:"is_correct,omitempty"`
	Score       *int       `json:"score,omitempty"`
	Feedback    *string    `json:"feedback,omitempty"`
	ExpEarned   int        `json:"exp_earned"`
	GoldEarned  int        `json:"gold_earned"`
	StartedAt   *time.Time `json:"started_at,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type CreateQuestRequest struct {
	ClassroomID       string   `json:"classroom_id" binding:"required,uuid"`
	Topic             string   `json:"topic" binding:"required"`
	Title             string   `json:"title" binding:"required"`
	Difficulty        string   `json:"difficulty" binding:"required,oneof=easy medium hard expert"`
	Description       string   `json:"description"`
	Question          string   `json:"question,omitempty"`
	Answer            string   `json:"answer,omitempty"`
	Hints             []string `json:"hints,omitempty"`
	Explanation       string   `json:"explanation,omitempty"`
	ExpReward         int      `json:"exp_reward,omitempty"`
	GoldReward        int      `json:"gold_reward,omitempty"`
	TimeLimitMinutes  *int     `json:"time_limit_minutes,omitempty"`
	QuestKind         string   `json:"quest_kind,omitempty" binding:"omitempty,oneof=standard special"`
	RequiredTitleCode string   `json:"required_title_code,omitempty"`
	UnlockNote        string   `json:"unlock_note,omitempty"`
}

type GenerateQuestRequest struct {
	ClassroomID string `json:"classroom_id" binding:"required,uuid"`
	Topic       string `json:"topic" binding:"required"`
}

type SubmitQuestRequest struct {
	QuestID string `json:"quest_id" binding:"required"`
	Answer  string `json:"answer" binding:"required"`
}
