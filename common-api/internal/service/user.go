package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserService struct {
	db *pgxpool.Pool
}

func NewUserService(db *pgxpool.Pool) *UserService { return &UserService{db: db} }

func (s *UserService) List(ctx context.Context) ([]*model.User, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
		 FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*model.User, 0)
	for rows.Next() {
		var u model.User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, rows.Err()
}

func (s *UserService) Get(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var u model.User
	err := s.db.QueryRow(ctx,
		`SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
		 FROM users WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
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
		`INSERT INTO users (email, password_hash, full_name, role, student_id, employee_id, department, phone)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at`,
		req.Email, hash, req.FullName, req.Role, req.StudentID, req.EmployeeID, req.Department, req.Phone,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
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
		 RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at`,
		id, req.FullName, req.Role, req.StudentID, req.EmployeeID, req.Department, req.Phone, req.Status,
	).Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
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
		`SELECT id, email, password_hash, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
		 FROM users WHERE email = $1 AND deleted_at IS NULL`, email,
	).Scan(&u.ID, &u.Email, &hash, &u.FullName, &u.Role, &u.StudentID, &u.EmployeeID, &u.Department, &u.Phone, &u.AvatarURL, &u.Status, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, "", err
	}
	return &u, hash, nil
}
