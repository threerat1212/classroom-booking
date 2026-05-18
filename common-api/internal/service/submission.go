package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SubmissionService struct {
	db *pgxpool.Pool
}

func NewSubmissionService(db *pgxpool.Pool) *SubmissionService { return &SubmissionService{db: db} }

func (s *SubmissionService) List(ctx context.Context, assignmentID, studentID *uuid.UUID) ([]*model.Submission, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at
		 FROM submissions WHERE deleted_at IS NULL
		   AND ($1::uuid IS NULL OR assignment_id = $1)
		   AND ($2::uuid IS NULL OR student_id = $2)
		 ORDER BY submitted_at DESC`, assignmentID, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.Submission, 0)
	for rows.Next() {
		var sub model.Submission
		if err := rows.Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &sub)
	}
	return items, rows.Err()
}

func (s *SubmissionService) Get(ctx context.Context, id uuid.UUID) (*model.Submission, error) {
	var sub model.Submission
	err := s.db.QueryRow(ctx,
		`SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at
		 FROM submissions WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (s *SubmissionService) Create(ctx context.Context, req model.CreateSubmissionRequest, studentID string) (*model.Submission, error) {
	sid, err := uuid.Parse(studentID)
	if err != nil {
		return nil, err
	}
	aid, err := uuid.Parse(req.AssignmentID)
	if err != nil {
		return nil, err
	}
	var sub model.Submission
	err = s.db.QueryRow(ctx,
		`INSERT INTO submissions (assignment_id, student_id, content, file_urls, external_link)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at`,
		aid, sid, req.Content, req.FileURLs, req.ExternalLink,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (s *SubmissionService) Update(ctx context.Context, id uuid.UUID, req model.UpdateSubmissionRequest) (*model.Submission, error) {
	var sub model.Submission
	err := s.db.QueryRow(ctx,
		`UPDATE submissions SET
			content = COALESCE($2, content),
			file_urls = COALESCE($3, file_urls),
			external_link = COALESCE($4, external_link),
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at`,
		id, req.Content, req.FileURLs, req.ExternalLink,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (s *SubmissionService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE submissions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

func (s *SubmissionService) Grade(ctx context.Context, id uuid.UUID, req model.GradeSubmissionRequest, gradedBy string) (*model.Submission, error) {
	gb, err := uuid.Parse(gradedBy)
	if err != nil {
		return nil, err
	}
	var sub model.Submission
	err = s.db.QueryRow(ctx,
		`UPDATE submissions SET
			score = $2,
			feedback = $3,
			graded_by = $4,
			graded_at = now(),
			status = 'graded',
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, feedback, graded_by, graded_at, created_at, updated_at`,
		id, req.Score, req.Feedback, gb,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}
