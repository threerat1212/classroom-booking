package service

import (
	"context"
	"math"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func XpForLevel(level int) int {
	if level <= 1 {
		return 0
	}
	return 50 * (level - 1) * level
}

func LevelFromXp(xp int) int {
	if xp <= 0 {
		return 1
	}
	L := (1 + math.Sqrt(1+float64(xp)*0.08)) / 2.0
	return int(L)
}

func RankTitleFromLevel(level int) string {
	switch {
	case level >= 50:
		return "Legend"
	case level >= 40:
		return "Grandmaster"
	case level >= 30:
		return "Master"
	case level >= 20:
		return "Expert"
	case level >= 15:
		return "Scholar"
	case level >= 10:
		return "Veteran"
	case level >= 7:
		return "Skilled"
	case level >= 5:
		return "Adept"
	case level >= 3:
		return "Apprentice"
	default:
		return "Novice"
	}
}

type UserService struct {
	db *pgxpool.Pool
}

func NewUserService(db *pgxpool.Pool) *UserService { return &UserService{db: db} }

var levelUnlockRules = []model.LevelUnlock{
	{Level: 1, Title: "Easy / Medium Quests", Description: "Start practice quests, hints, XP, and leaderboard ranking.", Category: "quests"},
	{Level: 2, Title: "Hard Quests + Daily Quest", Description: "Unlock harder practice and a daily review target.", Category: "quests"},
	{Level: 3, Title: "Expert Quests + Badge Cabinet", Description: "Unlock expert quests and collectible achievement badges.", Category: "quests"},
	{Level: 5, Title: "Profile Title & Frame", Description: "Unlock cosmetic profile titles and avatar frames.", Category: "cosmetic"},
	{Level: 7, Title: "Challenge Mode", Description: "Timed streak challenges for extra practice.", Category: "challenge"},
	{Level: 10, Title: "Weekly Boss Quest", Description: "A weekly class challenge with higher XP rewards.", Category: "challenge"},
	{Level: 15, Title: "Streak Rewards", Description: "Bonus badges for consistent study streaks.", Category: "rewards"},
	{Level: 20, Title: "Peer Challenge", Description: "Challenge classmates on the same quest set.", Category: "social"},
	{Level: 30, Title: "Master Quest", Description: "Long-form mastery quests for major topics.", Category: "mastery"},
	{Level: 40, Title: "Seasonal Leaderboard", Description: "Compete in seasonal rankings and rare badges.", Category: "season"},
	{Level: 50, Title: "Legend Hall of Fame", Description: "Legend title, profile effect, and hall of fame visibility.", Category: "legend"},
}

func unlocksForLevel(level int) []model.LevelUnlock {
	unlocks := make([]model.LevelUnlock, 0, len(levelUnlockRules))
	for _, unlock := range levelUnlockRules {
		unlock.Unlocked = level >= unlock.Level
		unlocks = append(unlocks, unlock)
	}
	return unlocks
}

func (s *UserService) LevelProgress(ctx context.Context, userID uuid.UUID) (*model.LevelProgress, error) {
	user, err := s.Get(ctx, userID)
	if err != nil {
		return nil, err
	}
	level := LevelFromXp(user.XP)
	rank := RankTitleFromLevel(level)
	if user.RankTitle != nil && *user.RankTitle != "" {
		rank = *user.RankTitle
	}
	return &model.LevelProgress{
		Level:          level,
		XP:             user.XP,
		RankTitle:      rank,
		CurrentLevelXP: XpForLevel(level),
		NextLevelXP:    XpForLevel(level + 1),
		Unlocks:        unlocksForLevel(level),
	}, nil
}

func (s *UserService) List(ctx context.Context) ([]*model.User, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at
		 FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*model.User, 0)
	for rows.Next() {
		var u model.User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, rows.Err()
}

func (s *UserService) Get(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at
		 FROM users WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *UserService) Create(ctx context.Context, req model.CreateUserRequest) (*model.User, error) {
	hash, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	var u model.User
	err = s.db.QueryRow(ctx,
		`INSERT INTO users (email, password_hash, full_name, role, student_id, employee_id, department, phone, avatar_url)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at`,
		req.Email, hash, req.FullName, req.Role, req.StudentID, req.EmployeeID, req.Department, req.Phone, req.AvatarURL,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, req model.UpdateUserRequest) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`UPDATE users SET
			full_name = COALESCE($2, full_name),
			role = COALESCE($3, role),
			student_id = COALESCE($4, student_id),
			employee_id = COALESCE($5, employee_id),
			department = COALESCE($6, department),
			phone = COALESCE($7, phone),
			status = COALESCE($8, status),
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at`,
		id, req.FullName, req.Role, req.StudentID, req.EmployeeID, req.Department, req.Phone, req.Status,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *UserService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

func (s *UserService) GetByEmail(ctx context.Context, email string) (*model.User, string, error) {
	var u model.User
	var hash string
	err := s.db.QueryRow(ctx,
		`SELECT id, email, password_hash, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at
		 FROM users WHERE email = $1 AND deleted_at IS NULL`, email,
	).Scan(&u.ID, &u.Email, &hash, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, "", err
	}
	return &u, hash, nil
}

func (s *UserService) Leaderboard(ctx context.Context, limit int) ([]*model.User, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := s.db.Query(ctx,
		`SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at
		 FROM users WHERE deleted_at IS NULL AND role = 'student' ORDER BY xp DESC, level DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*model.User, 0)
	for rows.Next() {
		var u model.User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, rows.Err()
}

func (s *UserService) AddXP(ctx context.Context, userID uuid.UUID, amount int, action, description, refType string, refID *uuid.UUID) (*model.User, error) {
	if amount <= 0 {
		return s.Get(ctx, userID)
	}

	// get current xp
	var currentXp int
	err := s.db.QueryRow(ctx, `SELECT xp FROM users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&currentXp)
	if err != nil {
		return nil, err
	}

	newXp := currentXp + amount
	newLevel := LevelFromXp(newXp)
	newRank := RankTitleFromLevel(newLevel)
	if equippedTitle := s.equippedTitleName(ctx, userID); equippedTitle != "" {
		newRank = equippedTitle
	}

	// update user first so a history-table issue cannot silently block rewards.
	var u model.User
	err = s.db.QueryRow(ctx,
		`UPDATE users SET xp = $2, level = $3, rank_title = $4, updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, xp, level, gold_balance, rank_title, last_login_at, created_at, updated_at`,
		userID, newXp, newLevel, newRank,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.XP, &u.Level, &u.Gold, &u.RankTitle, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// insert xp history after the reward is applied; history is useful but not
	// allowed to prevent the student from receiving earned XP.
	if refID != nil {
		_, err = s.db.Exec(ctx,
			`INSERT INTO xp_history (user_id, action, xp_amount, description, reference_type, reference_id) VALUES ($1, $2, $3, $4, $5, $6)`,
			userID, action, amount, description, refType, refID)
	} else {
		_, err = s.db.Exec(ctx,
			`INSERT INTO xp_history (user_id, action, xp_amount, description, reference_type) VALUES ($1, $2, $3, $4, $5)`,
			userID, action, amount, description, refType)
	}
	if err != nil {
		return &u, nil
	}
	return &u, nil
}

func (s *UserService) AddGold(ctx context.Context, userID uuid.UUID, amount int, action, description, refType string, refID *uuid.UUID) (int, error) {
	if amount <= 0 {
		var currentGold int
		err := s.db.QueryRow(ctx, `SELECT gold_balance FROM users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&currentGold)
		return currentGold, err
	}

	var balance int
	err := s.db.QueryRow(ctx,
		`UPDATE users SET gold_balance = gold_balance + $2, updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING gold_balance`,
		userID, amount,
	).Scan(&balance)
	if err != nil {
		return 0, err
	}

	if refID != nil {
		_, err = s.db.Exec(ctx,
			`INSERT INTO gold_history (user_id, action, gold_amount, balance_after, description, reference_type, reference_id)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			userID, action, amount, balance, description, refType, refID)
	} else {
		_, err = s.db.Exec(ctx,
			`INSERT INTO gold_history (user_id, action, gold_amount, balance_after, description, reference_type)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			userID, action, amount, balance, description, refType)
	}
	if err != nil {
		return balance, nil
	}
	return balance, nil
}

func (s *UserService) equippedTitleName(ctx context.Context, userID uuid.UUID) string {
	var title string
	err := s.db.QueryRow(ctx, `
		SELECT t.name
		FROM user_titles ut
		JOIN learning_titles t ON t.code = ut.title_code
		WHERE ut.user_id = $1 AND ut.is_equipped = true
		LIMIT 1`, userID).Scan(&title)
	if err != nil {
		return ""
	}
	return title
}
