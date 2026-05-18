package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const glmEndpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

func (s *AIService) Chat(ctx context.Context, userID uuid.UUID, sessionID *uuid.UUID, message string) (*model.AIChatResponse, error) {
	// Get or create session
	var sid uuid.UUID
	if sessionID != nil {
		sid = *sessionID
		// verify session belongs to user
		var ownerID uuid.UUID
		err := s.db.QueryRow(ctx, `SELECT user_id FROM ai_chat_sessions WHERE id = $1`, sid).Scan(&ownerID)
		if err != nil {
			return nil, fmt.Errorf("session not found")
		}
		if ownerID != userID {
			return nil, fmt.Errorf("unauthorized session")
		}
	} else {
		// create new session with title from first message
		title := message
		if len(title) > 50 {
			title = title[:50] + "..."
		}
		err := s.db.QueryRow(ctx,
			`INSERT INTO ai_chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id`,
			userID, title).Scan(&sid)
		if err != nil {
			return nil, err
		}
	}

	// Store user message
	_, err := s.db.Exec(ctx,
		`INSERT INTO ai_chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`,
		sid, message)
	if err != nil {
		return nil, err
	}

	// Build context from student's data
	contextStr, err := s.buildStudentContext(ctx, userID)
	if err != nil {
		contextStr = ""
	}

	// Build messages for GLM
	messages := []model.GLMMessage{
		{
			Role: "system",
			Content: `You are a helpful AI tutor assistant for a classroom management system. You can only answer questions related to:
- The student's assignments and homework
- The student's grades and scores
- The student's attendance records (present, late, absent)
- Study materials and lessons
- General study tips and encouragement

You MUST NOT answer questions about:
- Politics, religion, or controversial topics
- Personal matters outside school
- Anything unrelated to education or the student's academic progress

If asked about something outside these topics, politely decline and redirect to academic topics.

When answering about specific data, be precise and reference actual records.

Student Context:
` + contextStr,
		},
	}

	// Load previous messages from session (last 10)
	rows, err := s.db.Query(ctx,
		`SELECT role, content FROM ai_chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10`, sid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []model.GLMMessage
	for rows.Next() {
		var m model.GLMMessage
		if err := rows.Scan(&m.Role, &m.Content); err != nil {
			continue
		}
		history = append([]model.GLMMessage{m}, history...)
	}
	messages = append(messages, history...)

	// Call GLM API
	glmReq := model.GLMRequest{
		Model:    "glm-5",
		Messages: messages,
	}
	body, _ := json.Marshal(glmReq)

	httpReq, _ := http.NewRequestWithContext(ctx, "POST", glmEndpoint, bytes.NewReader(body))
	httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call GLM API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GLM API returned status %d", resp.StatusCode)
	}

	var glmResp model.GLMResponse
	if err := json.NewDecoder(resp.Body).Decode(&glmResp); err != nil {
		return nil, fmt.Errorf("failed to decode GLM response: %w", err)
	}
	if len(glmResp.Choices) == 0 {
		return nil, fmt.Errorf("no response from GLM")
	}

	reply := glmResp.Choices[0].Message.Content

	// Store assistant message
	_, err = s.db.Exec(ctx,
		`INSERT INTO ai_chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`,
		sid, reply)
	if err != nil {
		return nil, err
	}

	// Update session updated_at
	_, _ = s.db.Exec(ctx, `UPDATE ai_chat_sessions SET updated_at = now() WHERE id = $1`, sid)

	return &model.AIChatResponse{
		SessionID: sid,
		Message:   reply,
	}, nil
}

func (s *AIService) buildStudentContext(ctx context.Context, userID uuid.UUID) (string, error) {
	// Get assignments
	assignRows, err := s.db.Query(ctx,
		`SELECT a.title, a.status, a.due_date, a.max_score,
			 s.status as sub_status, s.score, s.submitted_at
		 FROM assignments a
		 LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = $1 AND s.deleted_at IS NULL
		 WHERE a.deleted_at IS NULL AND a.status = 'published'
		 ORDER BY a.due_date`, userID)
	if err != nil {
		return "", err
	}
	defer assignRows.Close()

	var assignments []string
	for assignRows.Next() {
		var title, aStatus, subStatus string
		var dueDate *time.Time
		var maxScore float64
		var score *float64
		var submittedAt *time.Time
		if err := assignRows.Scan(&title, &aStatus, &dueDate, &maxScore, &subStatus, &score, &submittedAt); err != nil {
			continue
		}
		status := "pending"
		if subStatus != "" {
			status = subStatus
		}
		assignments = append(assignments, fmt.Sprintf("- %s (Status: %s, Max: %.0f)", title, status, maxScore))
	}

	// Get attendance summary
	var present, late, absent int
	_ = s.db.QueryRow(ctx,
		`SELECT
			COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END), 0)
		 FROM attendance_records WHERE student_id = $1 AND deleted_at IS NULL`, userID).Scan(&present, &late, &absent)

	// Get grades summary
	var avgScore float64
	var gradeCount int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(AVG(score), 0), COUNT(*) FROM grades WHERE student_id = $1 AND deleted_at IS NULL`, userID).Scan(&avgScore, &gradeCount)

	ctxStr := fmt.Sprintf(`Current Assignments:
%s

Attendance Summary:
- Present: %d
- Late: %d
- Absent: %d

Grade Summary:
- Average Score: %.2f
- Total Graded Items: %d
`, "", present, late, absent, avgScore, gradeCount)

	if len(assignments) > 0 {
		assignStr := ""
		for _, a := range assignments {
			assignStr += a + "\n"
		}
		ctxStr = fmt.Sprintf(`Current Assignments:
%s

Attendance Summary:
- Present: %d
- Late: %d
- Absent: %d

Grade Summary:
- Average Score: %.2f
- Total Graded Items: %d
`, assignStr, present, late, absent, avgScore, gradeCount)
	}

	return ctxStr, nil
}

func (s *AIService) ListSessions(ctx context.Context, userID uuid.UUID) ([]*model.AIChatSession, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, user_id, title, created_at, updated_at FROM ai_chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*model.AIChatSession
	for rows.Next() {
		var s model.AIChatSession
		if err := rows.Scan(&s.ID, &s.UserID, &s.Title, &s.CreatedAt, &s.UpdatedAt); err != nil {
			continue
		}
		sessions = append(sessions, &s)
	}
	return sessions, rows.Err()
}

func (s *AIService) ListMessages(ctx context.Context, sessionID, userID uuid.UUID) ([]*model.AIChatMessage, error) {
	// verify ownership
	var ownerID uuid.UUID
	if err := s.db.QueryRow(ctx, `SELECT user_id FROM ai_chat_sessions WHERE id = $1`, sessionID).Scan(&ownerID); err != nil {
		return nil, fmt.Errorf("session not found")
	}
	if ownerID != userID {
		return nil, fmt.Errorf("unauthorized")
	}

	rows, err := s.db.Query(ctx,
		`SELECT id, session_id, role, content, created_at FROM ai_chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
		sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*model.AIChatMessage
	for rows.Next() {
		var m model.AIChatMessage
		if err := rows.Scan(&m.ID, &m.SessionID, &m.Role, &m.Content, &m.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, &m)
	}
	return messages, rows.Err()
}

type AIService struct {
	db         *pgxpool.Pool
	apiKey     string
	httpClient *http.Client
}

func NewAIService(db *pgxpool.Pool, apiKey string) *AIService {
	return &AIService{
		db:         db,
		apiKey:     apiKey,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}
