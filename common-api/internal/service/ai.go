package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"classroom-api/internal/config"
	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	defaultAIProvider = "openrouter"
	defaultAIBaseURL  = "https://openrouter.ai/api/v1/chat/completions"
	defaultAIModel    = "google/gemini-2.0-flash-exp:free"
)

func (s *AIService) Chat(ctx context.Context, userID uuid.UUID, sessionID *uuid.UUID, message string) (*model.AIChatResponse, error) {
	// Use independent context with 3-minute timeout for AI call to avoid HTTP request timeout cancellation
	aiCtx, aiCancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer aiCancel()

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
		title := aiChatSessionTitle(message)
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

	messages := []model.ChatCompletionMessage{
		{
			Role: "system",
			Content: `You are an AI tutor inside a school classroom management system.

Answer in Thai by default. Be friendly, concise, and student-safe.

You may answer only about:
- The student's pending assignments, submissions, due dates, grades, attendance, XP/learning progress, and class study questions.
- How to start solving a problem, hints, learning steps, and encouragement.

For problem-solving questions, guide the student step by step. Do not immediately dump the final answer unless the student explicitly asks for the final answer or the system context contains an official answer.

For grade questions, use the actual records in Student Context. If there is no official final grade scale, say it is an estimate from available scores.

If the question is outside school or academic progress, politely redirect back to learning topics.

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

	var history []model.ChatCompletionMessage
	for rows.Next() {
		var m model.ChatCompletionMessage
		if err := rows.Scan(&m.Role, &m.Content); err != nil {
			continue
		}
		history = append([]model.ChatCompletionMessage{m}, history...)
	}
	messages = append(messages, history...)

	reply, err := s.doAIRequest(aiCtx, messages)
	if err != nil {
		return nil, err
	}

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

func aiChatSessionTitle(message string) string {
	title := strings.TrimSpace(strings.ToValidUTF8(message, ""))
	if title == "" {
		return "New chat"
	}
	return truncateRunes(title, 50)
}

func truncateRunes(value string, max int) string {
	if max <= 0 {
		return ""
	}

	count := 0
	for idx := range value {
		if count == max {
			return value[:idx] + "..."
		}
		count++
	}
	return value
}

func (s *AIService) doAIRequest(ctx context.Context, messages []model.ChatCompletionMessage) (string, error) {
	if strings.TrimSpace(s.apiKey) == "" {
		return "", fmt.Errorf("AI_API_KEY is not configured")
	}

	if s.provider == "google" {
		return s.doGeminiRequest(ctx, messages)
	}

	aiReq := model.ChatCompletionRequest{Model: s.model, Messages: messages}
	body, err := json.Marshal(aiReq)
	if err != nil {
		return "", fmt.Errorf("failed to encode AI request: %w", err)
	}

	for attempt := 0; attempt < 4; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return "", fmt.Errorf("AI request cancelled during retry")
			}
		}

		httpReq, _ := http.NewRequestWithContext(ctx, "POST", s.baseURL, bytes.NewReader(body))
		httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)
		httpReq.Header.Set("Content-Type", "application/json")
		if s.provider == "openrouter" {
			if s.siteURL != "" {
				httpReq.Header.Set("HTTP-Referer", s.siteURL)
			}
			if s.appName != "" {
				httpReq.Header.Set("X-Title", s.appName)
			}
		}

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			continue
		}

		if resp.StatusCode == http.StatusOK {
			var aiResp model.ChatCompletionResponse
			if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
				resp.Body.Close()
				return "", fmt.Errorf("failed to decode AI response: %w", err)
			}
			resp.Body.Close()
			if len(aiResp.Choices) == 0 {
				return "", fmt.Errorf("no response from AI provider")
			}
			return aiResp.Choices[0].Message.Content, nil
		}

		_ = resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500 {
			continue
		}

		return "", fmt.Errorf("AI provider returned status %d", resp.StatusCode)
	}

	return "", fmt.Errorf("AI กำลัง busy มาก กรุณารอสักครู่แล้วลองใหม่ (rate limit)")
}

func (s *AIService) callAI(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	messages := []model.ChatCompletionMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userPrompt},
	}
	return s.doAIRequest(ctx, messages)
}

func (s *AIService) GenerateQuests(ctx context.Context, topic string, teacherID uuid.UUID) ([]*model.LearningQuest, error) {
	systemPrompt := `You are an educational AI that creates practice quests for students. You must output ONLY valid JSON.

Create 4 quests (easy, medium, hard, expert) for the given topic. Each quest must have:
- title: short title (Thai or English is fine)
- question: the actual question
- answer: correct answer (short)
- hints: array of 2 hint strings
- explanation: explanation of the answer
- exp_reward: number (easy=10, medium=25, hard=50, expert=80)
- time_limit_minutes: number (easy=5, medium=10, hard=15, expert=20)

Output format:
{
  "quests": [
    {"difficulty":"easy","title":"...","question":"...","answer":"...","hints":["...","..."],"explanation":"...","exp_reward":10,"time_limit_minutes":5},
    ...
  ]
}`

	// AI generation with independent 3-minute timeout
	aiCtx, aiCancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer aiCancel()
	content, err := s.callAI(aiCtx, systemPrompt, fmt.Sprintf("Create practice quests for the topic: %s", topic))
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var result struct {
		Quests []struct {
			Difficulty       string   `json:"difficulty"`
			Title            string   `json:"title"`
			Question         string   `json:"question"`
			Answer           string   `json:"answer"`
			Hints            []string `json:"hints"`
			Explanation      string   `json:"explanation"`
			ExpReward        int      `json:"exp_reward"`
			TimeLimitMinutes int      `json:"time_limit_minutes"`
		} `json:"quests"`
	}
	if err := json.Unmarshal([]byte(extractJSONObject(content)), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	quests := make([]*model.LearningQuest, 0, len(result.Quests))
	for _, q := range result.Quests {
		var quest model.LearningQuest
		err := s.db.QueryRow(ctx,
			`INSERT INTO learning_quests (teacher_id, title, topic, description, difficulty, question, answer, hints, explanation, exp_reward, time_limit_minutes, status)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
			 RETURNING id, teacher_id, title, topic, description, difficulty, question, answer, hints, explanation, exp_reward, time_limit_minutes, status, created_at, updated_at`,
			teacherID, q.Title, topic, "AI-generated practice quest", q.Difficulty, q.Question, q.Answer, q.Hints, q.Explanation, q.ExpReward, q.TimeLimitMinutes,
		).Scan(&quest.ID, &quest.TeacherID, &quest.Title, &quest.Topic, &quest.Description, &quest.Difficulty, &quest.Question, &quest.Answer, &quest.Hints, &quest.Explanation, &quest.ExpReward, &quest.TimeLimitMinutes, &quest.Status, &quest.CreatedAt, &quest.UpdatedAt)
		if err != nil {
			continue
		}
		quests = append(quests, &quest)
	}
	return quests, nil
}

func (s *AIService) GradeQuest(ctx context.Context, question, correctAnswer, studentAnswer string, expReward int) (*model.QuestAttempt, error) {
	systemPrompt := fmt.Sprintf(`You are an AI grader for student practice quests. You must output ONLY valid JSON.

Evaluate the student's answer to the question.
- Be lenient: accept partially correct answers if the student shows understanding.
- Award partial credit if the answer is close.

Output format:
{
  "is_correct": true/false,
  "score": 0-100 (percentage, 0 if completely wrong, partial for close answers, 100 if fully correct),
  "feedback": "Polite feedback in Thai. If correct: praise + encouragement. If wrong: explain why + show correct answer + encourage them. Include a fun consolation emoji or phrase if wrong.",
  "consolation_reward": "A fun, encouraging message like 'Nice try! You earned a virtual star for effort!' or 'Don\'t give up! Practice makes perfect!'",
  "exp_earned": number (full exp if score>=80, half if score>=50, 2 if score<50 as consolation)
}`)

	userPrompt := fmt.Sprintf("Question: %s\nCorrect Answer: %s\nStudent Answer: %s\nMax EXP: %d",
		question, correctAnswer, studentAnswer, expReward)

	// AI grading with independent 3-minute timeout
	aiCtx, aiCancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer aiCancel()
	content, err := s.callAI(aiCtx, systemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var result struct {
		IsCorrect         bool   `json:"is_correct"`
		Score             int    `json:"score"`
		Feedback          string `json:"feedback"`
		ConsolationReward string `json:"consolation_reward"`
		ExpEarned         int    `json:"exp_earned"`
	}
	if err := json.Unmarshal([]byte(extractJSONObject(content)), &result); err != nil {
		// fallback grading
		isCorrect := studentAnswer == correctAnswer
		score := 0
		if isCorrect {
			score = 100
		}
		return &model.QuestAttempt{
			Answer:    &studentAnswer,
			IsCorrect: &isCorrect,
			Score:     &score,
			Feedback:  strPtr("Simple match grading used."),
			ExpEarned: 0,
		}, nil
	}

	return &model.QuestAttempt{
		Answer:    &studentAnswer,
		IsCorrect: &result.IsCorrect,
		Score:     &result.Score,
		Feedback:  &result.Feedback,
		ExpEarned: result.ExpEarned,
	}, nil
}

func strPtr(s string) *string { return &s }

func extractJSONObject(content string) string {
	trimmed := strings.TrimSpace(content)
	if strings.HasPrefix(trimmed, "```") {
		trimmed = strings.TrimPrefix(trimmed, "```json")
		trimmed = strings.TrimPrefix(trimmed, "```")
		trimmed = strings.TrimSuffix(trimmed, "```")
		trimmed = strings.TrimSpace(trimmed)
	}
	start := strings.Index(trimmed, "{")
	end := strings.LastIndex(trimmed, "}")
	if start >= 0 && end > start {
		return trimmed[start : end+1]
	}
	return trimmed
}

// --- Gemini (Google AI) support ---

type GeminiContent struct {
	Role  string       `json:"role"`
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiRequest struct {
	Contents         []GeminiContent         `json:"contents"`
	GenerationConfig *GeminiGenerationConfig `json:"generationConfig,omitempty"`
}

type GeminiGenerationConfig struct {
	Temperature     float64 `json:"temperature,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
}

func (s *AIService) doGeminiRequest(ctx context.Context, messages []model.ChatCompletionMessage) (string, error) {
	var contents []GeminiContent
	for _, m := range messages {
		role := m.Role
		if role == "system" {
			role = "user"
		}
		contents = append(contents, GeminiContent{
			Role:  role,
			Parts: []GeminiPart{{Text: m.Content}},
		})
	}

	reqBody := GeminiRequest{
		Contents: contents,
		GenerationConfig: &GeminiGenerationConfig{
			Temperature:     0.7,
			MaxOutputTokens: 4096,
		},
	}
	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to encode Gemini request: %w", err)
	}

	url := fmt.Sprintf("%s?key=%s", s.baseURL, s.apiKey)

	for attempt := 0; attempt < 4; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(1<<uint(attempt-1)) * time.Second
			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return "", fmt.Errorf("AI request cancelled during retry")
			}
		}

		httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
		if err != nil {
			continue
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			continue
		}

		if resp.StatusCode == http.StatusOK {
			var geminiResp GeminiResponse
			if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
				resp.Body.Close()
				return "", fmt.Errorf("failed to decode Gemini response: %w", err)
			}
			resp.Body.Close()
			if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
				return "", fmt.Errorf("no response from Gemini")
			}
			return geminiResp.Candidates[0].Content.Parts[0].Text, nil
		}

		_ = resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500 {
			continue
		}

		return "", fmt.Errorf("Gemini API returned status %d", resp.StatusCode)
	}

	return "", fmt.Errorf("Gemini API กำลัง busy มาก กรุณารอสักครู่แล้วลองใหม่")
}

func (s *AIService) buildStudentContext(ctx context.Context, userID uuid.UUID) (string, error) {
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
	pendingCount := 0
	for assignRows.Next() {
		var title, aStatus string
		var subStatus *string
		var dueDate *time.Time
		var maxScore float64
		var score *float64
		var submittedAt *time.Time
		if err := assignRows.Scan(&title, &aStatus, &dueDate, &maxScore, &subStatus, &score, &submittedAt); err != nil {
			continue
		}
		status := "pending"
		if subStatus != nil && *subStatus != "" {
			status = *subStatus
		}
		if status == "pending" || status == "draft" {
			pendingCount++
		}
		due := "no due date"
		if dueDate != nil {
			due = dueDate.Format("2006-01-02 15:04")
		}
		scoreText := "not graded"
		if score != nil {
			scoreText = fmt.Sprintf("%.2f / %.0f", *score, maxScore)
		}
		submitted := "not submitted"
		if submittedAt != nil {
			submitted = submittedAt.Format("2006-01-02 15:04")
		}
		assignments = append(assignments, fmt.Sprintf("- %s (assignment status: %s, submission status: %s, due: %s, score: %s, submitted: %s)", title, aStatus, status, due, scoreText, submitted))
	}

	var present, late, absent int
	_ = s.db.QueryRow(ctx,
		`SELECT
			COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END), 0)
		 FROM attendance_records WHERE student_id = $1 AND deleted_at IS NULL`, userID).Scan(&present, &late, &absent)

	var avgScore float64
	var gradeCount int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(AVG(CASE WHEN max_score > 0 THEN score / max_score * 100 ELSE score END), 0), COUNT(*)
		 FROM grades WHERE student_id = $1 AND deleted_at IS NULL`, userID).Scan(&avgScore, &gradeCount)

	gradeRows, err := s.db.Query(ctx,
		`SELECT item_type, score, max_score, feedback, created_at
		 FROM grades
		 WHERE student_id = $1 AND deleted_at IS NULL
		 ORDER BY created_at DESC
		 LIMIT 10`, userID)
	if err != nil {
		return "", err
	}
	defer gradeRows.Close()

	var grades []string
	for gradeRows.Next() {
		var itemType string
		var score, maxScore float64
		var feedback *string
		var createdAt time.Time
		if err := gradeRows.Scan(&itemType, &score, &maxScore, &feedback, &createdAt); err != nil {
			continue
		}
		feedbackText := ""
		if feedback != nil && *feedback != "" {
			feedbackText = fmt.Sprintf(", feedback: %s", *feedback)
		}
		grades = append(grades, fmt.Sprintf("- %s: %.2f / %.0f on %s%s", itemType, score, maxScore, createdAt.Format("2006-01-02"), feedbackText))
	}

	ctxStr := fmt.Sprintf(`Current Assignments:
%s

Assignment Summary:
- Pending or draft submissions: %d

Attendance Summary:
- Present: %d
- Late: %d
- Absent: %d

Grade Summary:
- Estimated Average: %.2f%%
- Total Graded Items: %d
%s
`, "No published assignments found.", pendingCount, present, late, absent, avgScore, gradeCount, formatContextSection("Recent Grades:", grades))

	if len(assignments) > 0 {
		ctxStr = fmt.Sprintf(`Current Assignments:
%s

Assignment Summary:
- Pending or draft submissions: %d

Attendance Summary:
- Present: %d
- Late: %d
- Absent: %d

Grade Summary:
- Estimated Average: %.2f%%
- Total Graded Items: %d
%s
`, strings.Join(assignments, "\n"), pendingCount, present, late, absent, avgScore, gradeCount, formatContextSection("Recent Grades:", grades))
	}

	return ctxStr, nil
}

func formatContextSection(title string, lines []string) string {
	if len(lines) == 0 {
		return title + "\n- none"
	}
	return title + "\n" + strings.Join(lines, "\n")
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
	provider   string
	apiKey     string
	baseURL    string
	model      string
	appName    string
	siteURL    string
	httpClient *http.Client
}

func NewAIService(db *pgxpool.Pool, cfg *config.Config) *AIService {
	provider := strings.TrimSpace(cfg.AIProvider)
	if provider == "" {
		provider = defaultAIProvider
	}
	baseURL := strings.TrimSpace(cfg.AIBaseURL)
	if baseURL == "" {
		baseURL = defaultAIBaseURL
	}
	modelName := strings.TrimSpace(cfg.AIModel)
	if modelName == "" {
		modelName = defaultAIModel
	}

	return &AIService{
		db:         db,
		provider:   strings.ToLower(provider),
		apiKey:     strings.TrimSpace(cfg.AIAPIKey),
		baseURL:    baseURL,
		model:      modelName,
		appName:    strings.TrimSpace(cfg.AIAppName),
		siteURL:    strings.TrimSpace(cfg.AISiteURL),
		httpClient: &http.Client{Timeout: 180 * time.Second},
	}
}
