package service

import (
	"context"
	"fmt"
	"strings"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type QuestService struct {
	db           *pgxpool.Pool
	ai           *AIService
	achievements *AchievementService
}

func NewQuestService(db *pgxpool.Pool) *QuestService { return &QuestService{db: db} }

func (s *QuestService) SetAI(ai *AIService) { s.ai = ai }

func (s *QuestService) SetAchievements(achievements *AchievementService) {
	s.achievements = achievements
}

// List returns quests visible to the given user, filtered by role.
//   - teacher: quests they created (any classroom)
//   - student: quests for classrooms they're enrolled in
//   - admin:   all quests
//   - other:   empty
func (s *QuestService) List(ctx context.Context, userID uuid.UUID, role string) ([]*model.LearningQuest, error) {
	const baseSelect = `
		SELECT q.id, q.teacher_id, q.classroom_id, r.name, q.title, q.topic, q.description, q.difficulty,
		       q.exp_reward, q.time_limit_minutes, q.status, q.quest_kind,
		       q.required_title_code, rt.name, q.unlock_note,
		       CASE WHEN $2::text = 'student' AND q.required_title_code IS NOT NULL AND ut.user_id IS NULL THEN true ELSE false END AS is_locked,
		       CASE WHEN $2::text = 'student' AND q.required_title_code IS NOT NULL AND ut.user_id IS NULL THEN 'ปลดล็อกด้วยฉายา ' || COALESCE(rt.name, q.required_title_code) ELSE NULL END AS locked_reason,
		       CASE WHEN a.id IS NOT NULL THEN true ELSE false END AS is_completed
		FROM learning_quests q
		LEFT JOIN quest_attempts a ON a.quest_id = q.id AND a.student_id = $1
		LEFT JOIN rooms r          ON r.id = q.classroom_id
		LEFT JOIN learning_titles rt ON rt.code = q.required_title_code
		LEFT JOIN user_titles ut ON ut.title_code = q.required_title_code AND ut.user_id = $1
		WHERE q.deleted_at IS NULL AND q.status = 'active'`

	var (
		sql  string
		args = []interface{}{userID, role}
	)

	switch role {
	case "student":
		sql = baseSelect + `
		  AND (q.classroom_id IS NULL OR q.classroom_id IN (
		    SELECT room_id FROM classroom_members WHERE student_id = $1
		  ))
		ORDER BY q.quest_kind DESC, is_locked ASC, q.difficulty, q.created_at DESC`
	case "teacher":
		sql = baseSelect + ` AND q.teacher_id = $1 ORDER BY q.created_at DESC`
	case "admin":
		sql = baseSelect + ` ORDER BY q.created_at DESC`
	default:
		return []*model.LearningQuest{}, nil
	}

	rows, err := s.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quests []*model.LearningQuest
	for rows.Next() {
		var q model.LearningQuest
		if err := rows.Scan(&q.ID, &q.TeacherID, &q.ClassroomID, &q.ClassroomName, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.ExpReward, &q.TimeLimitMinutes, &q.Status, &q.QuestKind, &q.RequiredTitleCode, &q.RequiredTitleName, &q.UnlockNote, &q.IsLocked, &q.LockedReason, &q.IsCompleted); err != nil {
			continue
		}
		quests = append(quests, &q)
	}
	return quests, rows.Err()
}

func (s *QuestService) Get(ctx context.Context, id uuid.UUID) (*model.LearningQuest, error) {
	return s.getQuest(ctx, id, false)
}

func (s *QuestService) GetForUser(ctx context.Context, id, userID uuid.UUID, role string) (*model.LearningQuest, error) {
	quest, err := s.getQuest(ctx, id, false)
	if err != nil {
		return nil, err
	}
	if err := s.assertQuestAccess(ctx, quest, userID, role); err != nil {
		return nil, err
	}
	return quest, nil
}

func (s *QuestService) getQuest(ctx context.Context, id uuid.UUID, includeAnswer bool) (*model.LearningQuest, error) {
	var q model.LearningQuest
	answerSelect := "NULL::text"
	if includeAnswer {
		answerSelect = "q.answer"
	}
	err := s.db.QueryRow(ctx,
		fmt.Sprintf(`SELECT q.id, q.teacher_id, q.classroom_id, r.name, q.title, q.topic, q.description, q.difficulty,
		        q.question, %s, q.hints, q.explanation, q.exp_reward, q.time_limit_minutes, q.status,
		        q.quest_kind, q.required_title_code, rt.name, q.unlock_note,
		        q.created_at, q.updated_at
		 FROM learning_quests q
		 LEFT JOIN rooms r ON r.id = q.classroom_id
		 LEFT JOIN learning_titles rt ON rt.code = q.required_title_code
		 WHERE q.id = $1 AND q.deleted_at IS NULL`, answerSelect), id,
	).Scan(&q.ID, &q.TeacherID, &q.ClassroomID, &q.ClassroomName, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.Question, &q.Answer, &q.Hints, &q.Explanation, &q.ExpReward, &q.TimeLimitMinutes, &q.Status, &q.QuestKind, &q.RequiredTitleCode, &q.RequiredTitleName, &q.UnlockNote, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

// assertTeacherOwnsClassroom returns an error if the teacher does not own the
// given classroom (or the classroom does not exist).
func (s *QuestService) assertTeacherOwnsClassroom(ctx context.Context, teacherID, classroomID uuid.UUID) error {
	var owner uuid.UUID
	err := s.db.QueryRow(ctx,
		`SELECT teacher_id FROM rooms
		 WHERE id = $1 AND deleted_at IS NULL AND room_type = 'classroom'`, classroomID).Scan(&owner)
	if err != nil {
		return fmt.Errorf("classroom not found")
	}
	if owner != teacherID {
		return fmt.Errorf("teacher does not own this classroom")
	}
	return nil
}

func (s *QuestService) assertQuestAccess(ctx context.Context, quest *model.LearningQuest, userID uuid.UUID, role string) error {
	switch role {
	case "admin":
		return nil
	case "teacher":
		if quest.TeacherID != userID {
			return model.ErrForbidden
		}
		return nil
	case "student":
		if quest.ClassroomID != nil {
			var isMember bool
			if err := s.db.QueryRow(ctx,
				`SELECT EXISTS (
					SELECT 1 FROM classroom_members
					WHERE room_id = $1 AND student_id = $2
				)`, *quest.ClassroomID, userID).Scan(&isMember); err != nil {
				return err
			}
			if !isMember {
				return model.ErrForbidden
			}
		}
		if quest.RequiredTitleCode != nil && strings.TrimSpace(*quest.RequiredTitleCode) != "" {
			var hasTitle bool
			if err := s.db.QueryRow(ctx,
				`SELECT EXISTS (
					SELECT 1 FROM user_titles
					WHERE user_id = $1 AND title_code = $2
				)`, userID, *quest.RequiredTitleCode).Scan(&hasTitle); err != nil {
				return err
			}
			if !hasTitle {
				return model.ErrForbidden
			}
		}
		return nil
	default:
		return model.ErrForbidden
	}
}

func (s *QuestService) Create(ctx context.Context, teacherID uuid.UUID, req model.CreateQuestRequest) (*model.LearningQuest, error) {
	classroomID, err := uuid.Parse(req.ClassroomID)
	if err != nil {
		return nil, fmt.Errorf("invalid classroom id")
	}
	if err := s.assertTeacherOwnsClassroom(ctx, teacherID, classroomID); err != nil {
		return nil, err
	}

	difficulty := strings.ToLower(strings.TrimSpace(req.Difficulty))
	spec := questDifficultySpecs[difficulty]
	expReward := req.ExpReward
	if expReward <= 0 {
		expReward = spec.expReward
	}
	timeLimit := req.TimeLimitMinutes
	if timeLimit == nil && spec.timeLimitMinutes > 0 {
		v := spec.timeLimitMinutes
		timeLimit = &v
	}
	questKind := strings.TrimSpace(req.QuestKind)
	if questKind == "" {
		questKind = "standard"
	}
	question := strings.TrimSpace(req.Question)
	if question == "" {
		question = "AI generated question will be placed here"
	}
	var answer *string
	if strings.TrimSpace(req.Answer) != "" {
		v := strings.TrimSpace(req.Answer)
		answer = &v
	}
	var explanation *string
	if strings.TrimSpace(req.Explanation) != "" {
		v := strings.TrimSpace(req.Explanation)
		explanation = &v
	}
	var requiredTitleCode *string
	if strings.TrimSpace(req.RequiredTitleCode) != "" {
		v := strings.TrimSpace(req.RequiredTitleCode)
		requiredTitleCode = &v
	}
	var unlockNote *string
	if strings.TrimSpace(req.UnlockNote) != "" {
		v := strings.TrimSpace(req.UnlockNote)
		unlockNote = &v
	}

	var q model.LearningQuest
	err = s.db.QueryRow(ctx,
		`INSERT INTO learning_quests (
			teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints,
			explanation, exp_reward, time_limit_minutes, quest_kind, required_title_code, unlock_note
		)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		 RETURNING id, teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints,
		           explanation, exp_reward, time_limit_minutes, status, quest_kind, required_title_code, unlock_note, created_at, updated_at`,
		teacherID, classroomID, req.Title, req.Topic, req.Description, difficulty, question, answer, req.Hints,
		explanation, expReward, timeLimit, questKind, requiredTitleCode, unlockNote,
	).Scan(&q.ID, &q.TeacherID, &q.ClassroomID, &q.Title, &q.Topic, &q.Description, &q.Difficulty, &q.Question, &q.Answer, &q.Hints, &q.Explanation, &q.ExpReward, &q.TimeLimitMinutes, &q.Status, &q.QuestKind, &q.RequiredTitleCode, &q.UnlockNote, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (s *QuestService) Submit(ctx context.Context, studentID, questID uuid.UUID, answer string) (*model.QuestAttempt, error) {
	answer = strings.TrimSpace(answer)
	if answer == "" {
		return nil, fmt.Errorf("answer is required")
	}

	// Check if already attempted
	var existingID uuid.UUID
	err := s.db.QueryRow(ctx,
		`SELECT id FROM quest_attempts WHERE quest_id = $1 AND student_id = $2`, questID, studentID).Scan(&existingID)
	if err == nil {
		return nil, fmt.Errorf("already attempted this quest")
	}

	// Get quest details for scoring
	quest, err := s.getQuest(ctx, questID, true)
	if err != nil {
		return nil, err
	}
	if err := s.assertQuestAccess(ctx, quest, studentID, "student"); err != nil {
		return nil, err
	}

	// AI grading
	var graded *model.QuestAttempt
	if s.ai != nil && quest.Answer != nil {
		graded, err = s.ai.GradeQuest(ctx, quest.Question, *quest.Answer, answer, quest.ExpReward)
		if err != nil {
			graded = nil
		}
	}

	isCorrect := false
	score := 0
	feedback := "Incorrect. Please review the explanation and try again."
	expEarned := 0

	if graded != nil {
		isCorrect = *graded.IsCorrect
		score = *graded.Score
		if graded.Feedback != nil {
			feedback = *graded.Feedback
		}
		expEarned = graded.ExpEarned
	} else if quest.Answer != nil && answersEquivalent(*quest.Answer, answer) {
		isCorrect = true
		score = 100
		feedback = "Correct! Well done!"
		expEarned = quest.ExpReward
	}

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

	// Award XP
	if expEarned > 0 {
		userSvc := NewUserService(s.db)
		if _, err := userSvc.AddXP(ctx, studentID, expEarned, "quest_completed", fmt.Sprintf("Quest: %s (Score: %d%%)", quest.Title, score), "quest", &questID); err != nil {
			attempt.ExpEarned = 0
			_, _ = s.db.Exec(ctx, `UPDATE quest_attempts SET exp_earned = 0 WHERE id = $1`, attempt.ID)
		}
	}

	if s.achievements != nil {
		s.achievements.EvaluateQuestAttempt(ctx, studentID, quest, &attempt)
	}

	return &attempt, nil
}

func (s *QuestService) Generate(ctx context.Context, topic string, teacherID, classroomID uuid.UUID) ([]*model.LearningQuest, error) {
	if s.ai == nil {
		return nil, fmt.Errorf("AI service not available")
	}
	if err := s.assertTeacherOwnsClassroom(ctx, teacherID, classroomID); err != nil {
		return nil, err
	}
	return s.ai.GenerateQuests(ctx, topic, teacherID, classroomID)
}
