package service

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"classroom-api/internal/auth"
	"classroom-api/internal/config"
	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Services struct {
	Auth         *AuthService
	User         *UserService
	Room         *RoomService
	Classroom    *ClassroomService
	Booking      *BookingService
	Assignment   *AssignmentService
	Submission   *SubmissionService
	Attendance   *AttendanceService
	Grade        *GradeService
	Notification *NotificationService
	Badge        *BadgeService
	Export       *ExportService
	AI           *AIService
	Quest        *QuestService
	Achievement  *AchievementService
}

func NewServices(db *pgxpool.Pool, cfg *config.Config) *Services {
	svcs := &Services{
		Auth:         NewAuthService(db, cfg),
		User:         NewUserService(db),
		Room:         NewRoomService(db),
		Classroom:    NewClassroomService(db),
		Booking:      NewBookingService(db),
		Assignment:   NewAssignmentService(db),
		Submission:   NewSubmissionService(db),
		Attendance:   NewAttendanceService(db),
		Grade:        NewGradeService(db),
		Notification: NewNotificationService(db),
		Badge:        NewBadgeService(db),
		Export:       NewExportService(db),
		AI:           NewAIService(db, cfg),
		Quest:        NewQuestService(db),
		Achievement:  NewAchievementService(db),
	}
	svcs.Quest.SetAI(svcs.AI)
	svcs.Quest.SetAchievements(svcs.Achievement)
	return svcs
}

type AuthService struct {
	db                *pgxpool.Pool
	jwtSecret         string
	refreshSecret     string
	teacherInviteCode string
}

func NewAuthService(db *pgxpool.Pool, cfg *config.Config) *AuthService {
	return &AuthService{
		db:                db,
		jwtSecret:         cfg.JWTSecret,
		refreshSecret:     cfg.JWTRefreshSecret,
		teacherInviteCode: cfg.TeacherInviteCode,
	}
}

var (
	ErrEmailAlreadyRegistered         = errors.New("email already registered")
	ErrTeacherInviteCodeNotConfigured = errors.New("teacher invite code is not configured")
	ErrTeacherInviteCodeRequired      = errors.New("teacher invite code is required")
	ErrInvalidTeacherInviteCode       = errors.New("invalid teacher invite code")
)

func (s *AuthService) Login(ctx context.Context, email, password string) (*model.TokenResponse, *model.User, error) {
	userSvc := NewUserService(s.db)
	u, hash, err := userSvc.GetByEmail(ctx, email)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid credentials")
	}
	if !checkPassword(password, hash) {
		return nil, nil, fmt.Errorf("invalid credentials")
	}

	tp, err := auth.GenerateTokenPair(u.ID, u.Email, u.Role, s.jwtSecret, s.refreshSecret)
	if err != nil {
		return nil, nil, err
	}

	_, err = s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '7 days')
		 ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at, revoked_at = NULL`,
		u.ID, tp.RefreshToken)
	if err != nil {
		return nil, nil, err
	}

	_, _ = s.db.Exec(ctx, `UPDATE users SET last_login_at = now() WHERE id = $1`, u.ID)

	return &model.TokenResponse{
		AccessToken:  tp.AccessToken,
		RefreshToken: tp.RefreshToken,
		ExpiresIn:    tp.ExpiresIn,
	}, u, nil
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*model.TokenResponse, error) {
	var userID uuid.UUID
	var revokedAt *time.Time
	err := s.db.QueryRow(ctx,
		`SELECT user_id, revoked_at FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()`, refreshToken,
	).Scan(&userID, &revokedAt)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token")
	}
	if revokedAt != nil {
		return nil, fmt.Errorf("refresh token revoked")
	}

	userSvc := NewUserService(s.db)
	u, err := userSvc.Get(ctx, userID)
	if err != nil {
		return nil, err
	}

	tp, err := auth.GenerateTokenPair(u.ID, u.Email, u.Role, s.jwtSecret, s.refreshSecret)
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(ctx,
		`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, refreshToken)
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '7 days')`,
		u.ID, tp.RefreshToken)
	if err != nil {
		return nil, err
	}

	return &model.TokenResponse{
		AccessToken:  tp.AccessToken,
		RefreshToken: tp.RefreshToken,
		ExpiresIn:    tp.ExpiresIn,
	}, nil
}

func (s *AuthService) Register(ctx context.Context, req model.RegisterRequest) (*model.TokenResponse, *model.User, error) {
	userSvc := NewUserService(s.db)

	// check if email already exists
	_, _, err := userSvc.GetByEmail(ctx, req.Email)
	if err == nil {
		return nil, nil, ErrEmailAlreadyRegistered
	}

	role := req.Role
	if role == "" {
		role = "student"
	}

	if role == "teacher" {
		expectedInviteCode := strings.TrimSpace(s.teacherInviteCode)
		inviteCode := strings.TrimSpace(req.TeacherInviteCode)
		if expectedInviteCode == "" {
			return nil, nil, ErrTeacherInviteCodeNotConfigured
		}
		if inviteCode == "" {
			return nil, nil, ErrTeacherInviteCodeRequired
		}
		if len(inviteCode) != len(expectedInviteCode) ||
			subtle.ConstantTimeCompare([]byte(inviteCode), []byte(expectedInviteCode)) != 1 {
			return nil, nil, ErrInvalidTeacherInviteCode
		}
	}

	createReq := model.CreateUserRequest{
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Role:     role,
	}
	u, err := userSvc.Create(ctx, createReq)
	if err != nil {
		return nil, nil, err
	}

	tp, err := auth.GenerateTokenPair(u.ID, u.Email, u.Role, s.jwtSecret, s.refreshSecret)
	if err != nil {
		return nil, nil, err
	}

	_, err = s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '7 days')
		 ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at, revoked_at = NULL`,
		u.ID, tp.RefreshToken)
	if err != nil {
		return nil, nil, err
	}

	_, _ = s.db.Exec(ctx, `UPDATE users SET last_login_at = now() WHERE id = $1`, u.ID)

	return &model.TokenResponse{
		AccessToken:  tp.AccessToken,
		RefreshToken: tp.RefreshToken,
		ExpiresIn:    tp.ExpiresIn,
	}, u, nil
}

func (s *AuthService) GoogleLogin(ctx context.Context, credential, expectedClientID string) (*model.TokenResponse, *model.User, error) {
	// Verify Google ID token using Google's tokeninfo endpoint
	tokenInfoURL := "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential
	res, err := http.Get(tokenInfoURL)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify token with Google: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, nil, fmt.Errorf("invalid google token")
	}

	var tokenInfo struct {
		Iss           string `json:"iss"`
		Aud           string `json:"aud"`
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
		EmailVerified string `json:"email_verified"`
	}
	if err := json.NewDecoder(res.Body).Decode(&tokenInfo); err != nil {
		return nil, nil, fmt.Errorf("failed to decode token info: %w", err)
	}

	// Validate issuer
	if tokenInfo.Iss != "https://accounts.google.com" && tokenInfo.Iss != "accounts.google.com" {
		return nil, nil, fmt.Errorf("invalid token issuer")
	}

	// Validate audience (client ID)
	if expectedClientID != "" && tokenInfo.Aud != expectedClientID {
		return nil, nil, fmt.Errorf("invalid token audience")
	}

	if strings.ToLower(tokenInfo.EmailVerified) != "true" {
		return nil, nil, fmt.Errorf("email not verified")
	}

	userSvc := NewUserService(s.db)
	u, _, err := userSvc.GetByEmail(ctx, tokenInfo.Email)
	if err != nil {
		// User doesn't exist — create new user with OAuth
		createReq := model.CreateUserRequest{
			Email:     tokenInfo.Email,
			Password:  randomPassword(),
			FullName:  tokenInfo.Name,
			Role:      "student",
			AvatarURL: &tokenInfo.Picture,
		}
		u, err = userSvc.Create(ctx, createReq)
		if err != nil {
			return nil, nil, err
		}
	} else {
		// Update avatar if changed
		if tokenInfo.Picture != "" && (u.AvatarURL == nil || *u.AvatarURL != tokenInfo.Picture) {
			_, _ = s.db.Exec(ctx, `UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2`, tokenInfo.Picture, u.ID)
			u.AvatarURL = &tokenInfo.Picture
		}
	}

	tp, err := auth.GenerateTokenPair(u.ID, u.Email, u.Role, s.jwtSecret, s.refreshSecret)
	if err != nil {
		return nil, nil, err
	}

	_, err = s.db.Exec(ctx,
		`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '7 days')
		 ON CONFLICT (token_hash) DO UPDATE SET expires_at = EXCLUDED.expires_at, revoked_at = NULL`,
		u.ID, tp.RefreshToken)
	if err != nil {
		return nil, nil, err
	}

	_, _ = s.db.Exec(ctx, `UPDATE users SET last_login_at = now() WHERE id = $1`, u.ID)

	return &model.TokenResponse{
		AccessToken:  tp.AccessToken,
		RefreshToken: tp.RefreshToken,
		ExpiresIn:    tp.ExpiresIn,
	}, u, nil
}

func randomPassword() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *AuthService) RevokeRefreshToken(ctx context.Context, token string) error {
	_, err := s.db.Exec(ctx, `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, token)
	return err
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
