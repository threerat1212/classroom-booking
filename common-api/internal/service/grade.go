package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GradeService struct {
	db *pgxpool.Pool
}

func NewGradeService(db *pgxpool.Pool) *GradeService { return &GradeService{db: db} }

func (s *GradeService) List(ctx context.Context, studentID *uuid.UUID) ([]*model.Grade, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at
		 FROM grades WHERE deleted_at IS NULL
		   AND ($1::uuid IS NULL OR student_id = $1)
		 ORDER BY created_at DESC`, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.Grade, 0)
	for rows.Next() {
		var g model.Grade
		if err := rows.Scan(&g.ID, &g.StudentID, &g.ItemType, &g.ItemID, &g.Score, &g.MaxScore, &g.Feedback, &g.GradedBy, &g.CreatedAt, &g.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &g)
	}
	return items, rows.Err()
}

func (s *GradeService) Get(ctx context.Context, id uuid.UUID) (*model.Grade, error) {
	var g model.Grade
	err := s.db.QueryRow(ctx,
		`SELECT id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at
		 FROM grades WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&g.ID, &g.StudentID, &g.ItemType, &g.ItemID, &g.Score, &g.MaxScore, &g.Feedback, &g.GradedBy, &g.CreatedAt, &g.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (s *GradeService) Upsert(ctx context.Context, req model.UpsertGradeRequest, gradedBy string) (*model.Grade, error) {
	sid, err := uuid.Parse(req.StudentID)
	if err != nil {
		return nil, err
	}
	iid, err := uuid.Parse(req.ItemID)
	if err != nil {
		return nil, err
	}
	gb, err := uuid.Parse(gradedBy)
	if err != nil {
		return nil, err
	}
	var g model.Grade
	err = s.db.QueryRow(ctx,
		`INSERT INTO grades (student_id, item_type, item_id, score, max_score, feedback, graded_by)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (student_id, item_type, item_id) DO UPDATE SET
		     score = EXCLUDED.score,
		     max_score = EXCLUDED.max_score,
		     feedback = EXCLUDED.feedback,
		     graded_by = EXCLUDED.graded_by,
		     updated_at = now()
		 RETURNING id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at`,
		sid, req.ItemType, iid, req.Score, req.MaxScore, req.Feedback, gb,
	).Scan(&g.ID, &g.StudentID, &g.ItemType, &g.ItemID, &g.Score, &g.MaxScore, &g.Feedback, &g.GradedBy, &g.CreatedAt, &g.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

func (s *GradeService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE grades SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}
