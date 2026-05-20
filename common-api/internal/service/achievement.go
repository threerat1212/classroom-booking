package service

import (
	"context"
	"errors"
	"time"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AchievementService struct {
	db *pgxpool.Pool
}

func NewAchievementService(db *pgxpool.Pool) *AchievementService {
	return &AchievementService{db: db}
}

func (s *AchievementService) ListTitles(ctx context.Context) ([]*model.LearningTitle, error) {
	rows, err := s.db.Query(ctx, `
		SELECT code, name, description, rarity, is_unique, created_at
		FROM learning_titles
		ORDER BY
			CASE rarity
				WHEN 'legendary' THEN 4
				WHEN 'epic' THEN 3
				WHEN 'rare' THEN 2
				ELSE 1
			END,
			name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var titles []*model.LearningTitle
	for rows.Next() {
		var title model.LearningTitle
		var createdAt time.Time
		if err := rows.Scan(&title.Code, &title.Name, &title.Description, &title.Rarity, &title.IsUnique, &createdAt); err != nil {
			return nil, err
		}
		titles = append(titles, &title)
	}
	return titles, rows.Err()
}

func (s *AchievementService) Summary(ctx context.Context, userID uuid.UUID) (*model.AchievementSummary, error) {
	titleRows, err := s.db.Query(ctx, `
		SELECT t.code, t.name, t.description, t.rarity, t.is_unique,
		       ut.awarded_at, COALESCE(ut.is_equipped, false) AS is_equipped
		FROM learning_titles t
		LEFT JOIN user_titles ut ON ut.title_code = t.code AND ut.user_id = $1
		ORDER BY
			CASE t.rarity
				WHEN 'legendary' THEN 4
				WHEN 'epic' THEN 3
				WHEN 'rare' THEN 2
				ELSE 1
			END DESC,
			t.name`, userID)
	if err != nil {
		return nil, err
	}
	defer titleRows.Close()

	var (
		titles        []*model.LearningTitle
		equippedTitle *model.LearningTitle
	)
	for titleRows.Next() {
		var title model.LearningTitle
		if err := titleRows.Scan(&title.Code, &title.Name, &title.Description, &title.Rarity, &title.IsUnique, &title.AwardedAt, &title.IsEquipped); err != nil {
			return nil, err
		}
		title.IsUnlocked = title.AwardedAt != nil
		if title.IsEquipped {
			copyTitle := title
			equippedTitle = &copyTitle
		}
		titles = append(titles, &title)
	}
	if err := titleRows.Err(); err != nil {
		return nil, err
	}

	achievementRows, err := s.db.Query(ctx, `
		SELECT a.code, a.title_code, a.name, a.description, a.rarity, a.trigger_type,
		       ua.earned_at,
		       t.code, t.name, t.description, t.rarity, t.is_unique
		FROM learning_achievements a
		LEFT JOIN user_achievements ua ON ua.achievement_code = a.code AND ua.user_id = $1
		LEFT JOIN learning_titles t ON t.code = a.title_code
		WHERE a.is_active = true
		ORDER BY
			CASE a.rarity
				WHEN 'legendary' THEN 4
				WHEN 'epic' THEN 3
				WHEN 'rare' THEN 2
				ELSE 1
			END DESC,
			a.name`, userID)
	if err != nil {
		return nil, err
	}
	defer achievementRows.Close()

	var achievements []*model.LearningAchievement
	for achievementRows.Next() {
		var achievement model.LearningAchievement
		var titleCode, linkedCode, linkedName, linkedDescription, linkedRarity *string
		var linkedUnique *bool
		if err := achievementRows.Scan(
			&achievement.Code,
			&titleCode,
			&achievement.Name,
			&achievement.Description,
			&achievement.Rarity,
			&achievement.TriggerType,
			&achievement.EarnedAt,
			&linkedCode,
			&linkedName,
			&linkedDescription,
			&linkedRarity,
			&linkedUnique,
		); err != nil {
			return nil, err
		}
		achievement.TitleCode = titleCode
		achievement.IsEarned = achievement.EarnedAt != nil
		if linkedCode != nil && linkedName != nil && linkedDescription != nil && linkedRarity != nil && linkedUnique != nil {
			achievement.Title = &model.LearningTitle{
				Code:        *linkedCode,
				Name:        *linkedName,
				Description: *linkedDescription,
				Rarity:      *linkedRarity,
				IsUnique:    *linkedUnique,
				IsUnlocked:  achievement.IsEarned,
			}
		}
		achievements = append(achievements, &achievement)
	}
	if err := achievementRows.Err(); err != nil {
		return nil, err
	}

	var specialQuestCount int
	_ = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM learning_quests q
		LEFT JOIN user_titles ut ON ut.title_code = q.required_title_code AND ut.user_id = $1
		WHERE q.deleted_at IS NULL
		  AND q.status = 'active'
		  AND q.quest_kind = 'special'
		  AND (q.required_title_code IS NULL OR ut.user_id IS NOT NULL)`, userID).Scan(&specialQuestCount)

	return &model.AchievementSummary{
		Titles:            titles,
		Achievements:      achievements,
		EquippedTitle:     equippedTitle,
		SpecialQuestCount: specialQuestCount,
	}, nil
}

func (s *AchievementService) EquipTitle(ctx context.Context, userID uuid.UUID, titleCode string) (*model.EquipTitleResponse, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var title model.LearningTitle
	err = tx.QueryRow(ctx, `
		SELECT t.code, t.name, t.description, t.rarity, t.is_unique, ut.awarded_at
		FROM learning_titles t
		JOIN user_titles ut ON ut.title_code = t.code AND ut.user_id = $1
		WHERE t.code = $2`, userID, titleCode).Scan(&title.Code, &title.Name, &title.Description, &title.Rarity, &title.IsUnique, &title.AwardedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrForbidden
		}
		return nil, err
	}

	if _, err := tx.Exec(ctx, `UPDATE user_titles SET is_equipped = false WHERE user_id = $1`, userID); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `UPDATE user_titles SET is_equipped = true WHERE user_id = $1 AND title_code = $2`, userID, titleCode); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `UPDATE users SET rank_title = $2, updated_at = now() WHERE id = $1`, userID, title.Name); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	title.IsUnlocked = true
	title.IsEquipped = true
	return &model.EquipTitleResponse{RankTitle: title.Name, Title: &title}, nil
}

func (s *AchievementService) EvaluateQuestAttempt(ctx context.Context, studentID uuid.UUID, quest *model.LearningQuest, attempt *model.QuestAttempt) {
	if quest == nil || attempt == nil || attempt.IsCorrect == nil || !*attempt.IsCorrect {
		return
	}

	_ = s.awardAchievement(ctx, studentID, "first_quest_clear")

	if attempt.Score != nil && *attempt.Score >= 100 {
		_ = s.awardAchievement(ctx, studentID, "perfect_quest")
	}

	if quest.Difficulty == "expert" {
		_ = s.awardAchievement(ctx, studentID, "first_expert_clear_unique")
	}

	if quest.Difficulty == "hard" || quest.Difficulty == "expert" {
		streak, err := s.hardQuestStreakDays(ctx, studentID)
		if err == nil && streak >= 5 {
			_ = s.awardAchievement(ctx, studentID, "hard_streak_5_days")
		}
	}
}

func (s *AchievementService) awardAchievement(ctx context.Context, userID uuid.UUID, achievementCode string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var (
		titleCode        *string
		titleName        *string
		titleDescription *string
		titleRarity      *string
		titleUnique      *bool
	)
	err = tx.QueryRow(ctx, `
		SELECT a.title_code, t.name, t.description, t.rarity, t.is_unique
		FROM learning_achievements a
		LEFT JOIN learning_titles t ON t.code = a.title_code
		WHERE a.code = $1 AND a.is_active = true`, achievementCode).Scan(&titleCode, &titleName, &titleDescription, &titleRarity, &titleUnique)
	if err != nil {
		return err
	}

	tag, err := tx.Exec(ctx, `
		INSERT INTO user_achievements (user_id, achievement_code)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`, userID, achievementCode)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return tx.Commit(ctx)
	}

	if titleCode != nil && titleName != nil && titleDescription != nil && titleRarity != nil && titleUnique != nil {
		if err := s.awardTitleTx(ctx, tx, userID, *titleCode, *titleName, *titleDescription, *titleRarity, *titleUnique, &achievementCode); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (s *AchievementService) awardTitleTx(ctx context.Context, tx pgx.Tx, userID uuid.UUID, code, name, description, rarity string, isUnique bool, achievementCode *string) error {
	if isUnique {
		tag, err := tx.Exec(ctx, `
			INSERT INTO unique_title_claims (title_code, user_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`, code, userID)
		if err != nil {
			return err
		}
		if tag.RowsAffected() == 0 {
			return nil
		}
	}

	tag, err := tx.Exec(ctx, `
		INSERT INTO user_titles (user_id, title_code, awarded_from_achievement_code)
		VALUES ($1, $2, $3)
		ON CONFLICT DO NOTHING`, userID, code, achievementCode)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return nil
	}

	var hasEquipped bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM user_titles WHERE user_id = $1 AND is_equipped = true)`, userID).Scan(&hasEquipped); err != nil {
		return err
	}
	if !hasEquipped {
		if _, err := tx.Exec(ctx, `UPDATE user_titles SET is_equipped = true WHERE user_id = $1 AND title_code = $2`, userID, code); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `UPDATE users SET rank_title = $2, updated_at = now() WHERE id = $1`, userID, name); err != nil {
			return err
		}
	}

	// Auto-unlock associated character cosmetics
	_, err = tx.Exec(ctx, `
		INSERT INTO user_unlocked_items (user_id, item_code)
		SELECT $1, code FROM character_items WHERE required_title_code = $2
		ON CONFLICT DO NOTHING`, userID, code)
	if err != nil {
		return err
	}

	return nil
}

func (s *AchievementService) hardQuestStreakDays(ctx context.Context, userID uuid.UUID) (int, error) {
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT (a.completed_at AT TIME ZONE 'Asia/Bangkok')::date AS completed_day
		FROM quest_attempts a
		JOIN learning_quests q ON q.id = a.quest_id
		WHERE a.student_id = $1
		  AND a.is_correct = true
		  AND a.completed_at IS NOT NULL
		  AND q.difficulty IN ('hard', 'expert')
		ORDER BY completed_day DESC
		LIMIT 14`, userID)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	var (
		streak int
		prev   *time.Time
	)
	for rows.Next() {
		var day time.Time
		if err := rows.Scan(&day); err != nil {
			return streak, err
		}
		if prev == nil {
			streak = 1
			prev = &day
			continue
		}
		expected := prev.AddDate(0, 0, -1)
		if sameDate(day, expected) {
			streak++
			prev = &day
			continue
		}
		break
	}
	return streak, rows.Err()
}

func sameDate(a, b time.Time) bool {
	ay, am, ad := a.Date()
	by, bm, bd := b.Date()
	return ay == by && am == bm && ad == bd
}
