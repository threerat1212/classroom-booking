package service

import (
	"context"
	"strings"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardService struct {
	db *pgxpool.Pool
}

var supportedCommunityGrades = []string{"M3", "M4"}

func NewDashboardService(db *pgxpool.Pool) *DashboardService {
	return &DashboardService{db: db}
}

func normalizedGradeLevel(grade string) string {
	return strings.ToUpper(strings.TrimSpace(grade))
}

func canAccessGrade(role, userGrade, requestedGrade string, teacherGrades []string) bool {
	requested := normalizedGradeLevel(requestedGrade)
	userGrade = normalizedGradeLevel(userGrade)

	switch role {
	case "admin":
		return true
	case "student":
		if userGrade == "" {
			return false
		}
		return requested == "" || requested == userGrade
	case "teacher":
		if requested == "" {
			return len(teacherGrades) > 0
		}
		for _, grade := range teacherGrades {
			if normalizedGradeLevel(grade) == requested {
				return true
			}
		}
		return false
	default:
		return false
	}
}

func gradeDisplayName(grade string) string {
	normalized := normalizedGradeLevel(grade)
	if strings.HasPrefix(normalized, "M") && len(normalized) > 1 {
		return "ม." + normalized[1:]
	}
	return strings.TrimSpace(grade)
}

func gradeOptions(grades []string) []model.GradeOption {
	options := make([]model.GradeOption, 0, len(grades))
	seen := map[string]bool{}
	for _, grade := range grades {
		normalized := normalizedGradeLevel(grade)
		if normalized == "" || seen[normalized] {
			continue
		}
		seen[normalized] = true
		options = append(options, model.GradeOption{
			Code:    normalized,
			Display: gradeDisplayName(normalized),
		})
	}
	return options
}

func firstGrade(grades []string) string {
	for _, grade := range grades {
		if normalized := normalizedGradeLevel(grade); normalized != "" {
			return normalized
		}
	}
	return ""
}

func (s *DashboardService) CommunityDashboard(ctx context.Context, userIDStr, role, requestedGrade string) (*model.CommunityDashboard, error) {
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, err
	}

	userGrade, err := s.userGrade(ctx, userID)
	if err != nil {
		return nil, err
	}

	var accessibleGrades []string
	var teacherGrades []string
	switch role {
	case "student":
		if userGrade != "" {
			accessibleGrades = []string{userGrade}
		}
	case "teacher":
		teacherGrades, err = s.teacherGrades(ctx, userID)
		if err != nil {
			return nil, err
		}
		accessibleGrades = teacherGrades
	case "admin":
		adminGrades, err := s.adminGrades(ctx)
		if err != nil {
			return nil, err
		}
		accessibleGrades = append(append([]string{}, supportedCommunityGrades...), adminGrades...)
	default:
		return nil, model.ErrForbidden
	}

	selected := normalizedGradeLevel(requestedGrade)
	if selected == "" {
		if role == "student" {
			selected = userGrade
		} else {
			selected = firstGrade(accessibleGrades)
		}
	}

	dashboard := &model.CommunityDashboard{
		SelectedGrade:      selected,
		SelectedGradeLabel: gradeDisplayName(selected),
		AccessibleGrades:   gradeOptions(accessibleGrades),
		Feed:               []model.CommunityAchievementEvent{},
		TopRooms:           []model.CommunityTopRoom{},
		RareHighlights:     []model.CommunityRareHighlight{},
		Classrooms:         []model.CommunityClassroomCard{},
	}

	if role == "student" {
		dashboard.PrimaryClassroomID, _ = s.primaryClassroomID(ctx, userID)
		if userGrade == "" && requestedGrade == "" {
			return dashboard, nil
		}
	}

	if selected == "" {
		return dashboard, nil
	}
	if !canAccessGrade(role, userGrade, selected, teacherGrades) {
		return nil, model.ErrForbidden
	}

	dashboard.Stats, err = s.communityStats(ctx, selected)
	if err != nil {
		return nil, err
	}
	dashboard.Feed, err = s.communityFeed(ctx, selected, 10)
	if err != nil {
		return nil, err
	}
	dashboard.TopRooms, err = s.communityTopRooms(ctx, selected, 4)
	if err != nil {
		return nil, err
	}
	dashboard.RareHighlights, err = s.communityRareHighlights(ctx, selected, 5)
	if err != nil {
		return nil, err
	}
	dashboard.Classrooms, err = s.communityClassrooms(ctx, selected, userID)
	if err != nil {
		return nil, err
	}
	dashboard.WeeklyHighlight, err = s.communityWeeklyHighlight(ctx, selected)
	if err != nil {
		return nil, err
	}

	return dashboard, nil
}

func (s *DashboardService) ClassroomDashboard(ctx context.Context, classroomID uuid.UUID, userIDStr, role string) (*model.ClassroomDashboard, error) {
	classroom, err := NewClassroomService(s.db).Get(ctx, classroomID, userIDStr, role)
	if err != nil {
		return nil, err
	}

	leaderboard, err := s.classroomLeaderboard(ctx, classroomID, 10)
	if err != nil {
		return nil, err
	}
	badgeWall, err := s.classroomBadgeWall(ctx, classroomID, 20)
	if err != nil {
		return nil, err
	}
	progress, err := s.classroomQuestProgress(ctx, classroomID)
	if err != nil {
		return nil, err
	}
	moments, err := s.classroomMoments(ctx, classroomID, 10)
	if err != nil {
		return nil, err
	}

	return &model.ClassroomDashboard{
		Classroom:     classroom,
		Leaderboard:   leaderboard,
		BadgeWall:     badgeWall,
		QuestProgress: progress,
		RecentMoments: moments,
	}, nil
}

func (s *DashboardService) userGrade(ctx context.Context, userID uuid.UUID) (string, error) {
	var grade *string
	err := s.db.QueryRow(ctx, `SELECT grade_level FROM users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&grade)
	if err != nil {
		return "", err
	}
	return normalizedGradeLevel(valueOrEmpty(grade)), nil
}

func (s *DashboardService) teacherGrades(ctx context.Context, userID uuid.UUID) ([]string, error) {
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT grade_level
		FROM rooms
		WHERE deleted_at IS NULL
		  AND room_type = 'classroom'
		  AND teacher_id = $1
		  AND grade_level IS NOT NULL
		ORDER BY grade_level`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanGradeRows(rows)
}

func (s *DashboardService) adminGrades(ctx context.Context) ([]string, error) {
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT grade_level
		FROM (
			SELECT grade_level FROM users WHERE deleted_at IS NULL AND role = 'student' AND grade_level IS NOT NULL
			UNION
			SELECT grade_level FROM rooms WHERE deleted_at IS NULL AND room_type = 'classroom' AND grade_level IS NOT NULL
		) grades
		ORDER BY grade_level`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanGradeRows(rows)
}

func scanGradeRows(rows pgx.Rows) ([]string, error) {
	grades := []string{}
	for rows.Next() {
		var grade string
		if err := rows.Scan(&grade); err != nil {
			return nil, err
		}
		grades = append(grades, normalizedGradeLevel(grade))
	}
	return grades, rows.Err()
}

func (s *DashboardService) primaryClassroomID(ctx context.Context, userID uuid.UUID) (*uuid.UUID, error) {
	var id uuid.UUID
	err := s.db.QueryRow(ctx, `
		SELECT room_id
		FROM classroom_members
		WHERE student_id = $1 AND is_primary = true
		LIMIT 1`, userID).Scan(&id)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (s *DashboardService) communityStats(ctx context.Context, grade string) (model.CommunityDashboardStats, error) {
	var stats model.CommunityDashboardStats
	err := s.db.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND role = 'student' AND grade_level = $1)::int,
			(SELECT COUNT(*) FROM rooms WHERE deleted_at IS NULL AND room_type = 'classroom' AND grade_level = $1)::int,
			(SELECT COUNT(*)
			 FROM user_achievements ua
			 JOIN users u ON u.id = ua.user_id
			 JOIN learning_achievements la ON la.code = ua.achievement_code
			 WHERE u.deleted_at IS NULL AND u.grade_level = $1 AND la.rarity IN ('rare', 'epic', 'legendary'))::int,
			(SELECT COUNT(*)
			 FROM quest_attempts qa
			 JOIN users u ON u.id = qa.student_id
			 WHERE u.deleted_at IS NULL AND u.grade_level = $1 AND qa.completed_at IS NOT NULL AND COALESCE(qa.is_correct, false) = true)::int`,
		grade,
	).Scan(&stats.StudentCount, &stats.ClassroomCount, &stats.RareBadgeCount, &stats.QuestClearCount)
	return stats, err
}

func (s *DashboardService) communityFeed(ctx context.Context, grade string, limit int) ([]model.CommunityAchievementEvent, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, r.id, r.name, la.name, la.description, la.rarity, ua.earned_at
		FROM user_achievements ua
		JOIN users u ON u.id = ua.user_id
		JOIN learning_achievements la ON la.code = ua.achievement_code
		LEFT JOIN classroom_members cm ON cm.student_id = u.id AND cm.is_primary = true
		LEFT JOIN rooms r ON r.id = cm.room_id AND r.deleted_at IS NULL
		WHERE u.deleted_at IS NULL
		  AND u.grade_level = $1
		ORDER BY ua.earned_at DESC
		LIMIT $2`, grade, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []model.CommunityAchievementEvent{}
	for rows.Next() {
		var event model.CommunityAchievementEvent
		event.Type = "achievement"
		if err := rows.Scan(&event.StudentID, &event.StudentName, &event.ClassroomID, &event.ClassroomName, &event.Title, &event.Description, &event.Rarity, &event.OccurredAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func (s *DashboardService) communityTopRooms(ctx context.Context, grade string, limit int) ([]model.CommunityTopRoom, error) {
	rows, err := s.db.Query(ctx, `
		SELECT r.id, r.name, r.grade_level, r.class_section,
		       COUNT(DISTINCT cm.student_id)::int AS student_count,
		       COALESCE(SUM(u.xp), 0)::int AS total_xp,
		       COUNT(DISTINCT ua.achievement_code) FILTER (WHERE ua.earned_at >= now() - interval '7 days')::int AS recent_achievements
		FROM rooms r
		LEFT JOIN classroom_members cm ON cm.room_id = r.id
		LEFT JOIN users u ON u.id = cm.student_id AND u.deleted_at IS NULL
		LEFT JOIN user_achievements ua ON ua.user_id = u.id
		WHERE r.deleted_at IS NULL
		  AND r.room_type = 'classroom'
		  AND r.grade_level = $1
		GROUP BY r.id
		ORDER BY total_xp DESC, student_count DESC, r.name ASC
		LIMIT $2`, grade, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.CommunityTopRoom{}
	for rows.Next() {
		var item model.CommunityTopRoom
		if err := rows.Scan(&item.ClassroomID, &item.ClassroomName, &item.GradeLevel, &item.ClassSection, &item.StudentCount, &item.TotalXP, &item.RecentAchievement); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *DashboardService) communityRareHighlights(ctx context.Context, grade string, limit int) ([]model.CommunityRareHighlight, error) {
	rows, err := s.db.Query(ctx, `
		SELECT la.code, la.name, la.rarity, COUNT(*)::int AS earned_count
		FROM user_achievements ua
		JOIN users u ON u.id = ua.user_id
		JOIN learning_achievements la ON la.code = ua.achievement_code
		WHERE u.deleted_at IS NULL
		  AND u.grade_level = $1
		  AND la.rarity IN ('rare', 'epic', 'legendary')
		GROUP BY la.code, la.name, la.rarity
		ORDER BY earned_count DESC, la.name ASC
		LIMIT $2`, grade, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.CommunityRareHighlight{}
	for rows.Next() {
		var item model.CommunityRareHighlight
		if err := rows.Scan(&item.Code, &item.Name, &item.Rarity, &item.EarnedCount); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *DashboardService) communityClassrooms(ctx context.Context, grade string, userID uuid.UUID) ([]model.CommunityClassroomCard, error) {
	rows, err := s.db.Query(ctx, `
		SELECT r.id, r.name, r.code, r.grade_level, r.class_section,
		       COUNT(cm.student_id)::int AS student_count,
		       COALESCE(BOOL_OR(cm.student_id = $2 AND cm.is_primary = true), false) AS is_primary
		FROM rooms r
		LEFT JOIN classroom_members cm ON cm.room_id = r.id
		WHERE r.deleted_at IS NULL
		  AND r.room_type = 'classroom'
		  AND r.grade_level = $1
		GROUP BY r.id
		ORDER BY r.class_section NULLS LAST, r.name ASC`, grade, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.CommunityClassroomCard{}
	for rows.Next() {
		var item model.CommunityClassroomCard
		if err := rows.Scan(&item.ClassroomID, &item.Name, &item.Code, &item.GradeLevel, &item.ClassSection, &item.StudentCount, &item.IsPrimary); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *DashboardService) communityWeeklyHighlight(ctx context.Context, grade string) (*model.CommunityStudentHighlight, error) {
	var item model.CommunityStudentHighlight
	err := s.db.QueryRow(ctx, `
		SELECT id, full_name, xp, level, rank_title
		FROM users
		WHERE deleted_at IS NULL AND role = 'student' AND grade_level = $1
		ORDER BY xp DESC, level DESC, full_name ASC
		LIMIT 1`, grade).Scan(&item.StudentID, &item.FullName, &item.XP, &item.Level, &item.RankTitle)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *DashboardService) classroomLeaderboard(ctx context.Context, classroomID uuid.UUID, limit int) ([]model.ClassroomLeaderboardEntry, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, u.xp, u.level, u.rank_title
		FROM classroom_members cm
		JOIN users u ON u.id = cm.student_id
		WHERE cm.room_id = $1
		  AND u.deleted_at IS NULL
		ORDER BY u.xp DESC, u.level DESC, u.full_name ASC
		LIMIT $2`, classroomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.ClassroomLeaderboardEntry{}
	for rows.Next() {
		var item model.ClassroomLeaderboardEntry
		if err := rows.Scan(&item.StudentID, &item.FullName, &item.XP, &item.Level, &item.RankTitle); err != nil {
			return nil, err
		}
		item.Rank = len(items) + 1
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *DashboardService) classroomBadgeWall(ctx context.Context, classroomID uuid.UUID, limit int) ([]model.ClassroomBadgeWallItem, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, la.code, la.name, la.description, la.rarity, ua.earned_at
		FROM user_achievements ua
		JOIN users u ON u.id = ua.user_id
		JOIN classroom_members cm ON cm.student_id = u.id
		JOIN learning_achievements la ON la.code = ua.achievement_code
		WHERE cm.room_id = $1
		  AND u.deleted_at IS NULL
		ORDER BY ua.earned_at DESC
		LIMIT $2`, classroomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.ClassroomBadgeWallItem{}
	for rows.Next() {
		var item model.ClassroomBadgeWallItem
		if err := rows.Scan(&item.StudentID, &item.StudentName, &item.Code, &item.Name, &item.Description, &item.Rarity, &item.EarnedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *DashboardService) classroomQuestProgress(ctx context.Context, classroomID uuid.UUID) (model.ClassroomQuestProgress, error) {
	var progress model.ClassroomQuestProgress
	err := s.db.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM learning_quests WHERE deleted_at IS NULL AND status = 'active' AND classroom_id = $1)::int,
			(SELECT COUNT(*)
			 FROM quest_attempts qa
			 JOIN learning_quests q ON q.id = qa.quest_id
			 WHERE q.deleted_at IS NULL AND q.status = 'active' AND q.classroom_id = $1 AND qa.completed_at IS NOT NULL)::int,
			(SELECT COUNT(*) FROM classroom_members WHERE room_id = $1)::int`,
		classroomID,
	).Scan(&progress.ActiveQuestCount, &progress.CompletedCount, &progress.ParticipantCount)
	if err != nil {
		return progress, err
	}
	totalPossible := progress.ActiveQuestCount * progress.ParticipantCount
	if totalPossible > 0 {
		progress.CompletionPercent = (progress.CompletedCount * 100) / totalPossible
		if progress.CompletionPercent > 100 {
			progress.CompletionPercent = 100
		}
	}
	return progress, nil
}

func (s *DashboardService) classroomMoments(ctx context.Context, classroomID uuid.UUID, limit int) ([]model.CommunityAchievementEvent, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, r.id, r.name, la.name, la.description, la.rarity, ua.earned_at
		FROM user_achievements ua
		JOIN users u ON u.id = ua.user_id
		JOIN classroom_members cm ON cm.student_id = u.id
		JOIN rooms r ON r.id = cm.room_id
		JOIN learning_achievements la ON la.code = ua.achievement_code
		WHERE cm.room_id = $1
		  AND u.deleted_at IS NULL
		ORDER BY ua.earned_at DESC
		LIMIT $2`, classroomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []model.CommunityAchievementEvent{}
	for rows.Next() {
		var event model.CommunityAchievementEvent
		event.Type = "achievement"
		if err := rows.Scan(&event.StudentID, &event.StudentName, &event.ClassroomID, &event.ClassroomName, &event.Title, &event.Description, &event.Rarity, &event.OccurredAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}
