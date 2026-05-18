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
	Phone      *string    `json:"phone,omitempty"`
	AvatarURL  *string    `json:"avatar_url,omitempty"`
	Status     string     `json:"status"`
	LastLogin  *time.Time `json:"last_login_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
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
	Phone      *string `json:"phone,omitempty"`
	AvatarURL  *string `json:"avatar_url,omitempty"`
}

type UpdateUserRequest struct {
	FullName   *string `json:"full_name,omitempty"`
	Role       *string `json:"role,omitempty" binding:"omitempty,oneof=admin teacher student guest"`
	StudentID  *string `json:"student_id,omitempty"`
	EmployeeID *string `json:"employee_id,omitempty"`
	Department *string `json:"department,omitempty"`
	Phone      *string `json:"phone,omitempty"`
	Status     *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive suspended"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role" binding:"omitempty,oneof=student guest"`
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
