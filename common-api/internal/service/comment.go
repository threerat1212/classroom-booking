package service

import (
	"context"
	"errors"
	"fmt"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CommentService struct {
	db *pgxpool.Pool
}

func NewCommentService(db *pgxpool.Pool) *CommentService {
	return &CommentService{db: db}
}

func (s *CommentService) ListByAssignment(ctx context.Context, assignmentID uuid.UUID) ([]*model.CommentResponse, error) {
	rows, err := s.db.Query(ctx,
		`SELECT c.id, c.assignment_id, c.parent_id, c.author_id, c.content, c.is_edited, c.edited_at, c.created_at, c.updated_at,
		        u.full_name, u.role
		 FROM comments c
		 JOIN users u ON c.author_id = u.id
		 WHERE c.assignment_id = $1 AND c.deleted_at IS NULL
		 ORDER BY c.created_at ASC`, assignmentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*model.CommentResponse, 0)
	for rows.Next() {
		var c model.CommentResponse
		err := rows.Scan(
			&c.ID, &c.AssignmentID, &c.ParentID, &c.AuthorID, &c.Content, &c.IsEdited, &c.EditedAt, &c.CreatedAt, &c.UpdatedAt,
			&c.AuthorName, &c.AuthorRole,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, &c)
	}
	return items, rows.Err()
}

func (s *CommentService) Create(ctx context.Context, assignmentID, authorID uuid.UUID, req model.CreateCommentRequest) (*model.CommentResponse, error) {
	// Verify assignment exists and is not deleted
	var dummy uuid.UUID
	err := s.db.QueryRow(ctx, `SELECT id FROM assignments WHERE id = $1 AND deleted_at IS NULL`, assignmentID).Scan(&dummy)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	var parentID *uuid.UUID
	if req.ParentID != nil && *req.ParentID != "" {
		p, err := uuid.Parse(*req.ParentID)
		if err != nil {
			return nil, fmt.Errorf("%w: invalid parent_id format", model.ErrValidation)
		}
		// Verify parent comment exists
		var parentAssignmentID uuid.UUID
		err = s.db.QueryRow(ctx, `SELECT assignment_id FROM comments WHERE id = $1 AND deleted_at IS NULL`, p).Scan(&parentAssignmentID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, fmt.Errorf("%w: parent comment not found", model.ErrValidation)
			}
			return nil, err
		}
		if parentAssignmentID != assignmentID {
			return nil, fmt.Errorf("%w: parent comment belongs to a different assignment", model.ErrValidation)
		}
		parentID = &p
	}

	var c model.CommentResponse
	err = s.db.QueryRow(ctx,
		`INSERT INTO comments (assignment_id, parent_id, author_id, content)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, assignment_id, parent_id, author_id, content, is_edited, edited_at, created_at, updated_at`,
		assignmentID, parentID, authorID, req.Content,
	).Scan(&c.ID, &c.AssignmentID, &c.ParentID, &c.AuthorID, &c.Content, &c.IsEdited, &c.EditedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Fetch author details
	err = s.db.QueryRow(ctx, `SELECT full_name, role FROM users WHERE id = $1`, authorID).Scan(&c.AuthorName, &c.AuthorRole)
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func (s *CommentService) Update(ctx context.Context, commentID, authorID uuid.UUID, req model.UpdateCommentRequest) (*model.CommentResponse, error) {
	// Check comment existence and ownership
	var existingAuthorID uuid.UUID
	err := s.db.QueryRow(ctx, `SELECT author_id FROM comments WHERE id = $1 AND deleted_at IS NULL`, commentID).Scan(&existingAuthorID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	if existingAuthorID != authorID {
		return nil, model.ErrForbidden
	}

	var c model.CommentResponse
	err = s.db.QueryRow(ctx,
		`UPDATE comments
		 SET content = $1, is_edited = true, edited_at = now(), updated_at = now()
		 WHERE id = $2 AND deleted_at IS NULL
		 RETURNING id, assignment_id, parent_id, author_id, content, is_edited, edited_at, created_at, updated_at`,
		req.Content, commentID,
	).Scan(&c.ID, &c.AssignmentID, &c.ParentID, &c.AuthorID, &c.Content, &c.IsEdited, &c.EditedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Fetch author details
	err = s.db.QueryRow(ctx, `SELECT full_name, role FROM users WHERE id = $1`, authorID).Scan(&c.AuthorName, &c.AuthorRole)
	if err != nil {
		return nil, err
	}

	return &c, nil
}

func (s *CommentService) Delete(ctx context.Context, commentID, authorID uuid.UUID, role string) error {
	// Check comment existence and ownership
	var existingAuthorID uuid.UUID
	err := s.db.QueryRow(ctx, `SELECT author_id FROM comments WHERE id = $1 AND deleted_at IS NULL`, commentID).Scan(&existingAuthorID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return model.ErrNotFound
		}
		return err
	}

	// Only author, teacher, or admin can delete
	if existingAuthorID != authorID && role != "teacher" && role != "admin" {
		return model.ErrForbidden
	}

	_, err = s.db.Exec(ctx, `UPDATE comments SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL`, commentID)
	return err
}
