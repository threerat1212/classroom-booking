package service

import (
	"context"
	"fmt"
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
	Booking      *BookingService
	Assignment   *AssignmentService
	Submission   *SubmissionService
	Attendance   *AttendanceService
	Grade        *GradeService
	Notification *NotificationService
	Badge        *BadgeService
	Export       *ExportService
}

func NewServices(db *pgxpool.Pool, cfg *config.Config) *Services {
	return &Services{
		Auth:         NewAuthService(db, cfg),
		User:         NewUserService(db),
		Room:         NewRoomService(db),
		Booking:      NewBookingService(db),
		Assignment:   NewAssignmentService(db),
		Submission:   NewSubmissionService(db),
		Attendance:   NewAttendanceService(db),
		Grade:        NewGradeService(db),
		Notification: NewNotificationService(db),
		Badge:        NewBadgeService(db),
		Export:       NewExportService(db),
	}
}

type AuthService struct {
	db         *pgxpool.Pool
	jwtSecret  string
	refreshSecret string
}

func NewAuthService(db *pgxpool.Pool, cfg *config.Config) *AuthService {
	return &AuthService{db: db, jwtSecret: cfg.JWTSecret, refreshSecret: cfg.JWTRefreshSecret}
}

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
