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

type ChatCompletionMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ResponseFormat struct {
	Type string `json:"type"`
}

type ChatCompletionRequest struct {
	Model          string                  `json:"model"`
	Messages       []ChatCompletionMessage `json:"messages"`
	MaxTokens      int                     `json:"max_tokens,omitempty"`
	Temperature    float64                 `json:"temperature,omitempty"`
	ResponseFormat *ResponseFormat         `json:"response_format,omitempty"`
}

type ChatCompletionChoice struct {
	Message      ChatCompletionMessage `json:"message"`
	FinishReason string                `json:"finish_reason"`
}

type ChatCompletionResponse struct {
	Choices []ChatCompletionChoice `json:"choices"`
}
