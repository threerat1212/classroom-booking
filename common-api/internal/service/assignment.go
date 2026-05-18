package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AssignmentService struct {
	db *pgxpool.Pool
}

func NewAssignmentService(db *pgxpool.Pool) *AssignmentService { return &AssignmentService{db: db} }

func (s *AssignmentService) List(ctx context.Context) ([]*model.Assignment, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
		 FROM assignments WHERE deleted_at IS NULL ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.Assignment, 0)
	for rows.Next() {
		var a model.Assignment
		if err := rows.Scan(&a.ID, &a.TeacherID, &a.RoomID, &a.Title, &a.Description, &a.AssignmentType, &a.MaxScore, &a.DueDate, &a.Status, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &a)
	}
	return items, rows.Err()
}

func (s *AssignmentService) Get(ctx context.Context, id uuid.UUID) (*model.Assignment, error) {
	var a model.Assignment
	err := s.db.QueryRow(ctx,
		`SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
		 FROM assignments WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&a.ID, &a.TeacherID, &a.RoomID, &a.Title, &a.Description, &a.AssignmentType, &a.MaxScore, &a.DueDate, &a.Status, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AssignmentService) Create(ctx context.Context, req model.CreateAssignmentRequest, teacherID string) (*model.Assignment, error) {
	tid, err := uuid.Parse(teacherID)
	if err != nil {
		return nil, err
	}
	var rid *uuid.UUID
	if req.RoomID != nil && *req.RoomID != "" {
		p, err := uuid.Parse(*req.RoomID)
		if err != nil {
			return nil, err
		}
		rid = &p
	}
	var a model.Assignment
	err = s.db.QueryRow(ctx,
		`INSERT INTO assignments (teacher_id, room_id, title, description, assignment_type, max_score, due_date, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at`,
		tid, rid, req.Title, req.Description, req.AssignmentType, req.MaxScore, req.DueDate, req.Status,
	).Scan(&a.ID, &a.TeacherID, &a.RoomID, &a.Title, &a.Description, &a.AssignmentType, &a.MaxScore, &a.DueDate, &a.Status, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AssignmentService) Update(ctx context.Context, id uuid.UUID, req model.UpdateAssignmentRequest) (*model.Assignment, error) {
	var a model.Assignment
	err := s.db.QueryRow(ctx,
		`UPDATE assignments SET
			room_id = COALESCE($2, room_id),
			title = COALESCE($3, title),
			description = COALESCE($4, description),
			assignment_type = COALESCE($5, assignment_type),
			max_score = COALESCE($6, max_score),
			due_date = COALESCE($7, due_date),
			status = COALESCE($8, status),
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at`,
		id, req.RoomID, req.Title, req.Description, req.AssignmentType, req.MaxScore, req.DueDate, req.Status,
	).Scan(&a.ID, &a.TeacherID, &a.RoomID, &a.Title, &a.Description, &a.AssignmentType, &a.MaxScore, &a.DueDate, &a.Status, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AssignmentService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE assignments SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}
