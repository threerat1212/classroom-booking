package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID         uuid.UUID  `json:"id"`
	Email      string     `json:"email"`
	FullName   string     `json:"full_name"`
	Role       string     `json:"role"`
	StudentID  *string    `json:"student_id,omitempty"`
	EmployeeID *string    `json:"employee_id,omitempty"`
	Department *string    `json:"department,omitempty"`
	GradeLevel *string    `json:"grade_level,omitempty"`
	Phone      *string    `json:"phone,omitempty"`
	AvatarURL  *string    `json:"avatar_url,omitempty"`
	Status     string     `json:"status"`
	XP         int        `json:"xp"`
	Level      int        `json:"level"`
	Gold       int        `json:"gold_balance"`
	RankTitle  *string    `json:"rank_title,omitempty"`
	LastLogin  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type LevelUnlock struct {
	Level       int    `json:"level"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Unlocked    bool   `json:"unlocked"`
}

type LevelProgress struct {
	Level          int           `json:"level"`
	XP             int           `json:"xp"`
	RankTitle      string        `json:"rank_title"`
	CurrentLevelXP int           `json:"current_level_xp"`
	NextLevelXP    int           `json:"next_level_xp"`
	Unlocks        []LevelUnlock `json:"unlocks"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type CreateUserRequest struct {
	Email      string  `json:"email" binding:"required,email"`
	Password   string  `json:"password" binding:"required,min=6"`
	FullName   string  `json:"full_name" binding:"required"`
	Role       string  `json:"role" binding:"required,oneof=admin teacher student guest"`
	StudentID  *string `json:"student_id,omitempty"`
	EmployeeID *string `json:"employee_id,omitempty"`
	Department *string `json:"department,omitempty"`
	GradeLevel *string `json:"grade_level,omitempty" binding:"omitempty,oneof=M3 M4"`
	Phone      *string `json:"phone,omitempty"`
	AvatarURL  *string `json:"avatar_url,omitempty"`
}

type UpdateUserRequest struct {
	FullName   *string `json:"full_name,omitempty"`
	Role       *string `json:"role,omitempty" binding:"omitempty,oneof=admin teacher student guest"`
	StudentID  *string `json:"student_id,omitempty"`
	EmployeeID *string `json:"employee_id,omitempty"`
	Department *string `json:"department,omitempty"`
	GradeLevel *string `json:"grade_level,omitempty" binding:"omitempty,oneof=M3 M4"`
	Phone      *string `json:"phone,omitempty"`
	Status     *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive suspended"`
}

type RegisterRequest struct {
	Email             string `json:"email" binding:"required,email"`
	Password          string `json:"password" binding:"required,min=6"`
	FullName          string `json:"full_name" binding:"required"`
	Role              string `json:"role" binding:"omitempty,oneof=student teacher guest"`
	TeacherInviteCode string `json:"teacher_invite_code,omitempty"`
}

type GoogleLoginRequest struct {
	Credential string `json:"credential" binding:"required"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	User         *User  `json:"user"`
}
