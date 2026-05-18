package model

import (
	"time"

	"github.com/google/uuid"
)

type AIChatRequest struct {
	SessionID *uuid.UUID `json:"session_id,omitempty"`
	Message   string     `json:"message" binding:"required"`
}

type AIChatResponse struct {
	SessionID uuid.UUID `json:"session_id"`
	Message   string    `json:"message"`
}

type AIChatSession struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Title     *string   `json:"title,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type AIChatMessage struct {
	ID        uuid.UUID `json:"id"`
	SessionID uuid.UUID `json:"session_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type GLMMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GLMRequest struct {
	Model    string       `json:"model"`
	Messages []GLMMessage `json:"messages"`
}

type GLMChoice struct {
	Message GLMMessage `json:"message"`
}

type GLMResponse struct {
	Choices []GLMChoice `json:"choices"`
}
