package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"classroom-api/internal/config"
	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	defaultAIProvider     = "openrouter"
	defaultAIBaseURL      = "https://openrouter.ai/api/v1/chat/completions"
	defaultAIModel        = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
	defaultAIGradingModel = "arcee-ai/trinity-large-thinking:free"
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

	if !isAllowedStudentChatMessage(message) {
		reply := "ขอโทษครับ AI Tutor ตอบได้เฉพาะเรื่องบทเรียน งานที่ได้รับ คะแนน การเข้าเรียน และความก้าวหน้าการเรียนในห้องนี้เท่านั้น ลองถามเรื่องงานค้าง เนื้อหาที่เรียน หรือจำนวนครั้งที่ขาดเรียนได้นะครับ"
		_, _ = s.db.Exec(ctx,
			`INSERT INTO ai_chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`,
			sid, reply)
		_, _ = s.db.Exec(ctx, `UPDATE ai_chat_sessions SET updated_at = now() WHERE id = $1`, sid)
		return &model.AIChatResponse{SessionID: sid, Message: reply}, nil
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

Use Student Context as the source of truth for class records and learning materials. If the answer is not in Student Context and is not a normal academic explanation, say that the teacher has not added enough information yet.

For problem-solving questions, guide the student step by step. Do not immediately dump the final answer unless the student explicitly asks for the final answer or the system context contains an official answer.

For grade questions, use the actual records in Student Context. If there is no official final grade scale, say it is an estimate from available scores.

If the question is outside school or academic progress, politely redirect back to learning topics. Do not answer entertainment, romance, gambling, hacking, politics, adult, medical, legal, or financial advice questions.

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

func isAllowedStudentChatMessage(message string) bool {
	normalized := strings.ToLower(strings.TrimSpace(message))
	if normalized == "" {
		return false
	}

	blockedKeywords := []string{
		"พนัน", "บาคาร่า", "หวย", "แทงบอล", "casino", "gambling",
		"จีบ", "แฟน", "ความรัก", "18+", "โป๊", "sex", "porn",
		"แฮก", "hack", "crack", "ddos", "malware", "phishing",
		"หุ้น", "คริปโต", "ลงทุน", "crypto", "bitcoin", "forex",
		"การเมือง", "เลือกตั้ง", "พรรคการเมือง", "politics",
		"ยาอะไร", "รักษาโรค", "วินิจฉัย", "diagnose",
	}
	for _, keyword := range blockedKeywords {
		if strings.Contains(normalized, keyword) {
			return false
		}
	}

	allowedKeywords := []string{
		"เรียน", "บทเรียน", "เนื้อหา", "สรุป", "ทบทวน", "ห้องเรียน", "ครู",
		"งาน", "การบ้าน", "assignment", "คะแนน", "เกรด", "grade", "score",
		"ส่งงาน", "งานค้าง", "ครบกำหนด", "deadline", "due", "ขาด", "ลา", "สาย",
		"เช็คชื่อ", "เข้าเรียน", "attendance", "quest", "เควส", "xp", "level",
		"hint", "คำใบ้", "โจทย์", "คำถาม", "ข้อสอบ", "แบบฝึก", "วิชา",
		"คณิต", "วิทย์", "ฟิสิกส์", "เคมี", "ชีวะ", "ภาษาไทย", "อังกฤษ",
		"ประวัติ", "สังคม", "สมการ", "โมล", "สาร", "สูตร", "คำนวณ",
	}
	for _, keyword := range allowedKeywords {
		if strings.Contains(normalized, keyword) {
			return true
		}
	}

	return len([]rune(normalized)) <= 220 && strings.ContainsAny(normalized, "ไหม?=+-*/0123456789")
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

type aiRequestOptions struct {
	model       string
	temperature *float64
}

func (s *AIService) doAIRequest(ctx context.Context, messages []model.ChatCompletionMessage, opts ...aiRequestOptions) (string, error) {
	if strings.TrimSpace(s.apiKey) == "" {
		return "", fmt.Errorf("AI_API_KEY is not configured")
	}

	options := aiRequestOptions{model: s.model}
	if len(opts) > 0 {
		if strings.TrimSpace(opts[0].model) != "" {
			options.model = strings.TrimSpace(opts[0].model)
		}
		options.temperature = opts[0].temperature
	}

	if s.provider == "google" {
		return s.doGeminiRequest(ctx, messages, options.temperature)
	}

	aiReq := model.ChatCompletionRequest{Model: options.model, Messages: messages, Temperature: options.temperature}
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
	return s.callAIWithOptions(ctx, systemPrompt, userPrompt, aiRequestOptions{})
}

func (s *AIService) callAIWithOptions(ctx context.Context, systemPrompt, userPrompt string, opts aiRequestOptions) (string, error) {
	messages := []model.ChatCompletionMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userPrompt},
	}
	return s.doAIRequest(ctx, messages, opts)
}

type generatedQuestPayload struct {
	Difficulty       string   `json:"difficulty"`
	Title            string   `json:"title"`
	Question         string   `json:"question"`
	Answer           string   `json:"answer"`
	Hints            []string `json:"hints"`
	Explanation      string   `json:"explanation"`
	ExpReward        int      `json:"exp_reward"`
	TimeLimitMinutes int      `json:"time_limit_minutes"`
}

func (q *generatedQuestPayload) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	q.Difficulty = firstJSONString(raw, "difficulty", "level")
	q.Title = firstJSONString(raw, "title", "name")
	q.Question = firstJSONString(raw, "question", "prompt", "task", "problem")
	q.Answer = firstJSONString(raw, "answer", "correct_answer", "correctAnswer", "final_answer", "solution")
	q.Explanation = firstJSONString(raw, "explanation", "explain", "rationale", "reasoning", "solution_explanation")
	q.Hints = firstJSONStringArray(raw, "hints", "hint")
	q.ExpReward = firstJSONInt(raw, "exp_reward", "expReward", "xp", "reward")
	q.TimeLimitMinutes = firstJSONInt(raw, "time_limit_minutes", "timeLimitMinutes", "time_limit", "minutes")

	if len(q.Hints) == 0 {
		if hint1 := firstJSONString(raw, "hint1", "hint_1"); hint1 != "" {
			q.Hints = append(q.Hints, hint1)
		}
		if hint2 := firstJSONString(raw, "hint2", "hint_2"); hint2 != "" {
			q.Hints = append(q.Hints, hint2)
		}
	}

	return nil
}

type questDifficultySpec struct {
	expReward        int
	timeLimitMinutes int
}

var questDifficultyOrder = []string{"easy", "medium", "hard", "expert"}

var questDifficultySpecs = map[string]questDifficultySpec{
	"easy":   {expReward: 10, timeLimitMinutes: 5},
	"medium": {expReward: 25, timeLimitMinutes: 10},
	"hard":   {expReward: 50, timeLimitMinutes: 15},
	"expert": {expReward: 80, timeLimitMinutes: 20},
}

func normalizeGeneratedQuests(input []generatedQuestPayload, topic string) ([]generatedQuestPayload, error) {
	byDifficulty := make(map[string]generatedQuestPayload, len(questDifficultySpecs))
	topic = cleanGeneratedText(topic, 90)

	for _, q := range input {
		difficulty := normalizeQuestDifficulty(q.Difficulty)
		spec, ok := questDifficultySpecs[difficulty]
		if !ok {
			continue
		}
		if _, exists := byDifficulty[difficulty]; exists {
			continue
		}

		q.Difficulty = difficulty
		q.Title = cleanGeneratedText(q.Title, 90)
		q.Question = cleanGeneratedText(q.Question, 1200)
		q.Answer = cleanGeneratedText(q.Answer, 300)
		q.Explanation = cleanGeneratedText(q.Explanation, 1200)
		q.Hints = normalizeGeneratedHints(q.Hints)
		q.ExpReward = spec.expReward
		q.TimeLimitMinutes = spec.timeLimitMinutes

		if q.Title == "" {
			q.Title = defaultQuestTitle(topic, difficulty)
		}
		if q.Explanation == "" && q.Answer != "" {
			q.Explanation = fmt.Sprintf("คำตอบที่ถูกคือ %s", q.Answer)
		}

		if q.Question == "" || q.Answer == "" {
			return nil, fmt.Errorf("AI response included an incomplete %s quest", difficulty)
		}

		byDifficulty[difficulty] = q
	}

	quests := make([]generatedQuestPayload, 0, len(questDifficultyOrder))
	var missing []string
	for _, difficulty := range questDifficultyOrder {
		q, ok := byDifficulty[difficulty]
		if !ok {
			missing = append(missing, difficulty)
			continue
		}
		quests = append(quests, q)
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("AI response missing valid quest difficulty: %s", strings.Join(missing, ", "))
	}

	return quests, nil
}

func normalizeQuestDifficulty(value string) string {
	normalized := strings.ToLower(strings.TrimSpace(value))
	normalized = strings.Trim(normalized, " :-_")
	switch normalized {
	case "easy", "ง่าย", "ระดับง่าย":
		return "easy"
	case "medium", "ปานกลาง", "กลาง", "ระดับปานกลาง":
		return "medium"
	case "hard", "ยาก", "ระดับยาก":
		return "hard"
	case "expert", "ยากมาก", "ท้าทาย", "เชี่ยวชาญ", "ระดับยากมาก":
		return "expert"
	default:
		return normalized
	}
}

func firstJSONString(raw map[string]json.RawMessage, keys ...string) string {
	for _, key := range keys {
		value, ok := raw[key]
		if !ok {
			continue
		}

		var s string
		if err := json.Unmarshal(value, &s); err == nil {
			return strings.TrimSpace(s)
		}

		var n json.Number
		if err := json.Unmarshal(value, &n); err == nil {
			return n.String()
		}
	}
	return ""
}

func firstJSONStringArray(raw map[string]json.RawMessage, keys ...string) []string {
	for _, key := range keys {
		value, ok := raw[key]
		if !ok {
			continue
		}

		var items []string
		if err := json.Unmarshal(value, &items); err == nil {
			return items
		}

		var single string
		if err := json.Unmarshal(value, &single); err == nil && strings.TrimSpace(single) != "" {
			return []string{single}
		}
	}
	return nil
}

func firstJSONInt(raw map[string]json.RawMessage, keys ...string) int {
	for _, key := range keys {
		value, ok := raw[key]
		if !ok {
			continue
		}

		var i int
		if err := json.Unmarshal(value, &i); err == nil {
			return i
		}

		var f float64
		if err := json.Unmarshal(value, &f); err == nil {
			return int(f)
		}

		var s string
		if err := json.Unmarshal(value, &s); err == nil {
			var parsed int
			if _, err := fmt.Sscanf(strings.TrimSpace(s), "%d", &parsed); err == nil {
				return parsed
			}
		}
	}
	return 0
}

func defaultQuestTitle(topic, difficulty string) string {
	labels := map[string]string{
		"easy":   "Easy",
		"medium": "Medium",
		"hard":   "Hard",
		"expert": "Expert",
	}
	label := labels[difficulty]
	if label == "" {
		label = "Practice"
	}
	if topic == "" {
		return label + " Quest"
	}
	return fmt.Sprintf("%s - %s", topic, label)
}

func normalizeGeneratedHints(hints []string) []string {
	normalized := make([]string, 0, 2)
	for _, hint := range hints {
		cleaned := cleanGeneratedText(hint, 240)
		if cleaned != "" {
			normalized = append(normalized, cleaned)
		}
		if len(normalized) == 2 {
			return normalized
		}
	}

	defaultHints := []string{
		"ลองทบทวนแนวคิดหลักของหัวข้อนี้ก่อนตอบ",
		"แยกโจทย์เป็นขั้นตอนเล็ก ๆ แล้วตรวจคำตอบอีกครั้ง",
	}
	for _, hint := range defaultHints {
		if len(normalized) == 2 {
			break
		}
		normalized = append(normalized, hint)
	}
	return normalized
}

func cleanGeneratedText(value string, maxRunes int) string {
	cleaned := strings.TrimSpace(strings.ToValidUTF8(value, ""))
	if maxRunes > 0 {
		return truncateRunes(cleaned, maxRunes)
	}
	return cleaned
}

func (s *AIService) GenerateQuests(ctx context.Context, topic string, teacherID, classroomID uuid.UUID) ([]*model.LearningQuest, error) {
	topic = strings.TrimSpace(topic)
	if topic == "" {
		return nil, fmt.Errorf("topic is required")
	}

	systemPrompt := `You are an educational AI that creates classroom practice quests. Output ONLY valid JSON. Do not wrap it in markdown.

Create exactly 4 quests for the given topic: one easy, one medium, one hard, and one expert.

Rules:
- Use Thai by default unless the topic is clearly English-language practice.
- Each question must be self-contained and answerable without files, images, or hidden context.
- Avoid vague opinion questions. Prefer questions with a clear, checkable answer.
- The answer must be a concise canonical answer. Include acceptable wording in the explanation, not in the answer.
- Hints must guide the student without giving the final answer.
- Difficulty, exp_reward, and time_limit_minutes must match the values below.

Required output shape:
{
  "quests": [
    {"difficulty":"easy","title":"...","question":"...","answer":"...","hints":["...","..."],"explanation":"...","exp_reward":10,"time_limit_minutes":5},
    {"difficulty":"medium","title":"...","question":"...","answer":"...","hints":["...","..."],"explanation":"...","exp_reward":25,"time_limit_minutes":10},
    {"difficulty":"hard","title":"...","question":"...","answer":"...","hints":["...","..."],"explanation":"...","exp_reward":50,"time_limit_minutes":15},
    {"difficulty":"expert","title":"...","question":"...","answer":"...","hints":["...","..."],"explanation":"...","exp_reward":80,"time_limit_minutes":20}
  ]
}`

	// AI generation with independent 3-minute timeout
	aiCtx, aiCancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer aiCancel()
	content, err := s.callAIWithOptions(aiCtx, systemPrompt, fmt.Sprintf("Create practice quests for the topic: %s", topic), aiRequestOptions{
		temperature: floatPtr(0.35),
	})
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var result struct {
		Quests []generatedQuestPayload `json:"quests"`
	}
	if err := json.Unmarshal([]byte(sanitizeJSONControlChars(extractJSONObject(content))), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	normalized, err := normalizeGeneratedQuests(result.Quests, topic)
	if err != nil {
		return nil, err
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	quests := make([]*model.LearningQuest, 0, len(normalized))
	for _, q := range normalized {
		var quest model.LearningQuest
		err := tx.QueryRow(ctx,
			`INSERT INTO learning_quests (teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints, explanation, exp_reward, time_limit_minutes, status)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
			 RETURNING id, teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints, explanation, exp_reward, time_limit_minutes, status, created_at, updated_at`,
			teacherID, classroomID, q.Title, topic, "AI-generated practice quest", q.Difficulty, q.Question, q.Answer, q.Hints, q.Explanation, q.ExpReward, q.TimeLimitMinutes,
		).Scan(&quest.ID, &quest.TeacherID, &quest.ClassroomID, &quest.Title, &quest.Topic, &quest.Description, &quest.Difficulty, &quest.Question, &quest.Answer, &quest.Hints, &quest.Explanation, &quest.ExpReward, &quest.TimeLimitMinutes, &quest.Status, &quest.CreatedAt, &quest.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to save %s quest: %w", q.Difficulty, err)
		}
		quests = append(quests, &quest)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return quests, nil
}

func (s *AIService) GradeQuest(ctx context.Context, question, correctAnswer, studentAnswer string, expReward int) (*model.QuestAttempt, error) {
	studentAnswer = strings.TrimSpace(studentAnswer)
	if grade := deterministicQuestGrade(correctAnswer, studentAnswer, expReward); grade != nil {
		return grade, nil
	}

	systemPrompt := `You are a strict but fair AI grader for classroom practice quests. Output ONLY valid JSON. Do not wrap it in markdown.

Evaluate the student's answer to the question.
- Grade semantic equivalence, not exact wording.
- Accept Thai/English wording when the core meaning is equivalent.
- Ignore minor spelling, capitalization, punctuation, and harmless unit formatting differences.
- Do not accept answers that merely repeat the question or contain contradictions.
- Use this rubric:
  - 90-100: fully correct or equivalent.
  - 70-89: mostly correct, minor omission.
  - 40-69: partially correct, important gaps.
  - 1-39: shows effort but mostly wrong.
  - 0: blank, unrelated, copied question, or no useful understanding.
- Set is_correct to true only when score is 80 or higher.
- Give concise, polite feedback in Thai. If wrong, explain the main issue and include the correct answer.

Output format:
{
  "is_correct": true/false,
  "score": 0-100,
  "feedback": "..."
}`

	userPrompt := fmt.Sprintf("<question>\n%s\n</question>\n<correct_answer>\n%s\n</correct_answer>\n<student_answer>\n%s\n</student_answer>\nMax EXP: %d",
		question, correctAnswer, studentAnswer, expReward)

	// AI grading with independent 3-minute timeout
	aiCtx, aiCancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer aiCancel()
	content, err := s.callAIWithOptions(aiCtx, systemPrompt, userPrompt, aiRequestOptions{
		model:       s.gradingModel,
		temperature: floatPtr(0),
	})
	if err != nil {
		return nil, err
	}

	// Parse JSON response
	var result struct {
		IsCorrect bool   `json:"is_correct"`
		Score     int    `json:"score"`
		Feedback  string `json:"feedback"`
	}
	if err := json.Unmarshal([]byte(sanitizeJSONControlChars(extractJSONObject(content))), &result); err != nil {
		return fallbackQuestGrade(correctAnswer, studentAnswer, expReward), nil
	}

	score := clampScore(result.Score)
	isCorrect := score >= 80
	feedback := strings.TrimSpace(result.Feedback)
	if feedback == "" {
		feedback = questFeedback(correctAnswer, isCorrect)
	}

	return &model.QuestAttempt{
		Answer:    &studentAnswer,
		IsCorrect: &isCorrect,
		Score:     &score,
		Feedback:  &feedback,
		ExpEarned: questExpForScore(score, expReward, studentAnswer != ""),
	}, nil
}

func deterministicQuestGrade(correctAnswer, studentAnswer string, expReward int) *model.QuestAttempt {
	studentAnswer = strings.TrimSpace(studentAnswer)
	if studentAnswer == "" {
		score := 0
		isCorrect := false
		feedback := "ยังไม่ได้ส่งคำตอบ ลองตอบก่อนแล้วส่งใหม่อีกครั้งนะครับ"
		return &model.QuestAttempt{
			Answer:    &studentAnswer,
			IsCorrect: &isCorrect,
			Score:     &score,
			Feedback:  &feedback,
			ExpEarned: 0,
		}
	}

	if answersEquivalent(correctAnswer, studentAnswer) {
		score := 100
		isCorrect := true
		feedback := questFeedback(correctAnswer, true)
		return &model.QuestAttempt{
			Answer:    &studentAnswer,
			IsCorrect: &isCorrect,
			Score:     &score,
			Feedback:  &feedback,
			ExpEarned: questExpForScore(score, expReward, true),
		}
	}

	return nil
}

func fallbackQuestGrade(correctAnswer, studentAnswer string, expReward int) *model.QuestAttempt {
	if grade := deterministicQuestGrade(correctAnswer, studentAnswer, expReward); grade != nil {
		return grade
	}

	score := 0
	isCorrect := false
	feedback := questFeedback(correctAnswer, false)
	return &model.QuestAttempt{
		Answer:    &studentAnswer,
		IsCorrect: &isCorrect,
		Score:     &score,
		Feedback:  &feedback,
		ExpEarned: questExpForScore(score, expReward, strings.TrimSpace(studentAnswer) != ""),
	}
}

func answersEquivalent(correctAnswer, studentAnswer string) bool {
	if normalizeAnswer(correctAnswer) == "" || normalizeAnswer(studentAnswer) == "" {
		return false
	}
	if normalizeAnswer(correctAnswer) == normalizeAnswer(studentAnswer) {
		return true
	}
	return numericAnswersEquivalent(correctAnswer, studentAnswer)
}

func normalizeAnswer(answer string) string {
	answer = strings.ToLower(strings.TrimSpace(strings.ToValidUTF8(answer, "")))
	var b strings.Builder
	for _, r := range answer {
		switch {
		case unicode.IsLetter(r), unicode.IsDigit(r):
			b.WriteRune(r)
		case r == '.' || r == '-' || r == '+':
			b.WriteRune(r)
		}
	}
	return b.String()
}

var answerNumberPattern = regexp.MustCompile(`[-+]?\d+(?:\.\d+)?`)

func numericAnswersEquivalent(correctAnswer, studentAnswer string) bool {
	correctAnswer = strings.ReplaceAll(correctAnswer, ",", "")
	studentAnswer = strings.ReplaceAll(studentAnswer, ",", "")
	if !numericOnlyAnswer(correctAnswer) {
		return false
	}
	correctNumbers := answerNumberPattern.FindAllString(correctAnswer, -1)
	studentNumbers := answerNumberPattern.FindAllString(studentAnswer, -1)
	if len(correctNumbers) == 0 || len(correctNumbers) != len(studentNumbers) {
		return false
	}

	for i := range correctNumbers {
		correctValue, err := strconv.ParseFloat(correctNumbers[i], 64)
		if err != nil {
			return false
		}
		studentValue, err := strconv.ParseFloat(studentNumbers[i], 64)
		if err != nil {
			return false
		}
		tolerance := math.Max(0.000001, math.Abs(correctValue)*0.001)
		if math.Abs(correctValue-studentValue) > tolerance {
			return false
		}
	}
	return true
}

func numericOnlyAnswer(answer string) bool {
	withoutNumbers := answerNumberPattern.ReplaceAllString(answer, "")
	for _, r := range withoutNumbers {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			return false
		}
	}
	return true
}

func clampScore(score int) int {
	if score < 0 {
		return 0
	}
	if score > 100 {
		return 100
	}
	return score
}

func questExpForScore(score, maxExp int, attempted bool) int {
	if maxExp <= 0 || !attempted {
		return 0
	}
	score = clampScore(score)
	switch {
	case score >= 80:
		return maxExp
	case score >= 50:
		return maxInt(1, maxExp/2)
	case score > 0:
		return minInt(2, maxExp)
	default:
		return 0
	}
}

func questFeedback(correctAnswer string, isCorrect bool) string {
	if isCorrect {
		return "ถูกต้องครับ ทำได้ดีมาก ลองไปต่อข้อที่ยากขึ้นได้เลย"
	}
	return fmt.Sprintf("คำตอบนี้ยังไม่ถูกต้อง คำตอบที่ถูกคือ: %s ลองทบทวนแนวคิดแล้วฝึกอีกครั้งนะครับ", correctAnswer)
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func floatPtr(v float64) *float64 { return &v }

func sanitizeJSONControlChars(input string) string {
	var b strings.Builder
	b.Grow(len(input))

	inString := false
	escaped := false
	for _, r := range input {
		if escaped {
			b.WriteRune(r)
			escaped = false
			continue
		}

		if inString && r == '\\' {
			b.WriteRune(r)
			escaped = true
			continue
		}

		if r == '"' {
			inString = !inString
			b.WriteRune(r)
			continue
		}

		if inString {
			switch r {
			case '\n':
				b.WriteString(`\n`)
			case '\r':
				b.WriteString(`\r`)
			case '\t':
				b.WriteString(`\t`)
			case '\b':
				b.WriteString(`\b`)
			case '\f':
				b.WriteString(`\f`)
			default:
				if r < 0x20 {
					b.WriteString(fmt.Sprintf(`\u%04x`, r))
				} else {
					b.WriteRune(r)
				}
			}
			continue
		}

		b.WriteRune(r)
	}

	return b.String()
}

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

func (s *AIService) doGeminiRequest(ctx context.Context, messages []model.ChatCompletionMessage, temperature *float64) (string, error) {
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

	requestTemperature := 0.7
	if temperature != nil {
		requestTemperature = *temperature
	}

	reqBody := GeminiRequest{
		Contents: contents,
		GenerationConfig: &GeminiGenerationConfig{
			Temperature:     requestTemperature,
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

	materialRows, err := s.db.Query(ctx,
		`SELECT r.name, lm.title, lm.material_type, lm.description, lm.content, lm.url
		 FROM learning_materials lm
		 JOIN rooms r ON r.id = lm.classroom_id
		 JOIN classroom_members cm ON cm.room_id = lm.classroom_id AND cm.student_id = $1
		 WHERE lm.deleted_at IS NULL
		   AND lm.is_published = true
		   AND r.deleted_at IS NULL
		 ORDER BY lm.sort_order ASC, lm.created_at DESC
		 LIMIT 12`, userID)
	if err != nil {
		return "", err
	}
	defer materialRows.Close()

	var materials []string
	for materialRows.Next() {
		var classroomName, title, materialType string
		var description, content, url *string
		if err := materialRows.Scan(&classroomName, &title, &materialType, &description, &content, &url); err != nil {
			continue
		}
		details := ""
		if description != nil && strings.TrimSpace(*description) != "" {
			details += ", description: " + truncateRunes(strings.TrimSpace(*description), 220)
		}
		if content != nil && strings.TrimSpace(*content) != "" {
			details += ", content: " + truncateRunes(strings.TrimSpace(*content), 520)
		}
		if url != nil && strings.TrimSpace(*url) != "" {
			details += ", url: " + truncateRunes(strings.TrimSpace(*url), 180)
		}
		materials = append(materials, fmt.Sprintf("- [%s] %s (%s%s)", classroomName, title, materialType, details))
	}
	if err := materialRows.Err(); err != nil {
		return "", err
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

Learning Materials:
%s
`, "No published assignments found.", pendingCount, present, late, absent, avgScore, gradeCount, formatContextSection("Recent Grades:", grades), formatContextLines(materials))

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

Learning Materials:
%s
`, strings.Join(assignments, "\n"), pendingCount, present, late, absent, avgScore, gradeCount, formatContextSection("Recent Grades:", grades), formatContextLines(materials))
	}

	return ctxStr, nil
}

func formatContextSection(title string, lines []string) string {
	if len(lines) == 0 {
		return title + "\n- none"
	}
	return title + "\n" + strings.Join(lines, "\n")
}

func formatContextLines(lines []string) string {
	if len(lines) == 0 {
		return "- none"
	}
	return strings.Join(lines, "\n")
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
	db           *pgxpool.Pool
	provider     string
	apiKey       string
	baseURL      string
	model        string
	gradingModel string
	appName      string
	siteURL      string
	httpClient   *http.Client
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
	gradingModel := strings.TrimSpace(cfg.AIGradingModel)
	if gradingModel == "" {
		gradingModel = defaultAIGradingModel
	}

	return &AIService{
		db:           db,
		provider:     strings.ToLower(provider),
		apiKey:       strings.TrimSpace(cfg.AIAPIKey),
		baseURL:      baseURL,
		model:        modelName,
		gradingModel: gradingModel,
		appName:      strings.TrimSpace(cfg.AIAppName),
		siteURL:      strings.TrimSpace(cfg.AISiteURL),
		httpClient:   &http.Client{Timeout: 180 * time.Second},
	}
}
