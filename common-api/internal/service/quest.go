package service

import (
	"context"
	"fmt"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type QuestService struct {
	db *pgxpool.Pool
}

func NewQuestService(db *pgxpool.Pool) *QuestService { return &QuestService{db: db} }

func (s *QuestService) List(ctx context.Context, studentID uuid.UUID) ([]*model.LearningQuest, error) {
	rows, err := s.db.Query(ctx,
		`SELECT q.id, q.teacher_id, q.title, q.topic, q.description, q.difficulty, q.exp_reward, q.time_limit_minutes, q.status,
			CASE WHEN a.id IS NOT NULL THEN true ELSE false END as is_completed
		 FROM learning_quests q
		 LEFT JOIN quest_attempts a ON a.quest_id = q.id AND a.student_id = $1
		 WHERE q.deleted_at IS NULL AND q.status = 'active'
		 ORDER BY q.difficulty, q.created_at DESC`, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quests []*model.LearningQuest
	for rows.Next() {
		var q model.LearningQuest
		if err := rows.Scan(&q.ID, &q.TeacherID, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.ExpReward, &q.TimeLimitMinutes, &q.Status, &q.IsCompleted); err != nil {
			continue
		}
		quests = append(quests, &q)
	}
	return quests, rows.Err()
}

func (s *QuestService) Get(ctx context.Context, id uuid.UUID) (*model.LearningQuest, error) {
	var q model.LearningQuest
	err := s.db.QueryRow(ctx,
		`SELECT id, teacher_id, title, topic, description, difficulty, question, hints, explanation, exp_reward, time_limit_minutes, status, created_at, updated_at
		 FROM learning_quests WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&q.ID, &q.TeacherID, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.Question, &q.Hints, &q.Explanation, &q.ExpReward, &q.TimeLimitMinutes, &q.Status, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (s *QuestService) Create(ctx context.Context, teacherID uuid.UUID, req model.CreateQuestRequest) (*model.LearningQuest, error) {
	var q model.LearningQuest
	err := s.db.QueryRow(ctx,
		`INSERT INTO learning_quests (teacher_id, title, topic, description, difficulty, question, exp_reward)
		 VALUES ($1, $2, $3, $4, $5, 'AI generated question will be placed here', 10)
		 RETURNING id, teacher_id, title, topic, description, difficulty, exp_reward, status, created_at, updated_at`,
		teacherID, req.Title, req.Topic, req.Description, req.Difficulty,
	).Scan(&q.ID, &q.TeacherID, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.ExpReward, &q.Status, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (s *QuestService) Submit(ctx context.Context, studentID, questID uuid.UUID, answer string) (*model.QuestAttempt, error) {
	// Check if already attempted
	var existingID uuid.UUID
	err := s.db.QueryRow(ctx,
		`SELECT id FROM quest_attempts WHERE quest_id = $1 AND student_id = $2`, questID, studentID).Scan(&existingID)
	if err == nil {
		return nil, fmt.Errorf("already attempted this quest")
	}

	// Get quest details for scoring
	quest, err := s.Get(ctx, questID)
	if err != nil {
		return nil, err
	}

	// Simple scoring: exact match for now, AI grading to be added
	isCorrect := false
	score := 0
	feedback := "Incorrect. Please review the explanation and try again."
	expEarned := 0

	if quest.Answer != nil && answer == *quest.Answer {
		isCorrect = true
		score = 100
		feedback = "Correct! Well done!"
		expEarned = quest.ExpReward
	}

	// Insert attempt
	var attempt model.QuestAttempt
	err = s.db.QueryRow(ctx,
		`INSERT INTO quest_attempts (quest_id, student_id, answer, is_correct, score, feedback, exp_earned, completed_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, now())
		 RETURNING id, quest_id, student_id, answer, is_correct, score, feedback, exp_earned, completed_at, created_at`,
		questID, studentID, answer, isCorrect, score, feedback, expEarned,
	).Scan(&attempt.ID, &attempt.QuestID, &attempt.StudentID, &attempt.Answer, &attempt.IsCorrect, &attempt.Score, &attempt.Feedback, &attempt.ExpEarned, &attempt.CompletedAt, &attempt.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Award XP if correct
	if isCorrect && expEarned > 0 {
		userSvc := NewUserService(s.db)
		_, _ = userSvc.AddXP(ctx, studentID, expEarned, "quest_completed", fmt.Sprintf("Completed quest: %s", quest.Title), "quest", &questID)
	}

	return &attempt, nil
}
