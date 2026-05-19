package service

import (
	"context"
	"fmt"
	"strings"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SubmissionService struct {
	db *pgxpool.Pool
}

func NewSubmissionService(db *pgxpool.Pool) *SubmissionService { return &SubmissionService{db: db} }

func GradeCodeForScore(score, maxScore int) string {
	if maxScore <= 0 {
		maxScore = 100
	}
	percent := float64(score) / float64(maxScore) * 100
	switch {
	case percent < 50:
		return "0"
	case percent < 55:
		return "1"
	case percent < 60:
		return "1.5"
	case percent < 65:
		return "2"
	case percent < 70:
		return "2.5"
	case percent < 75:
		return "3"
	case percent < 80:
		return "3.5"
	default:
		return "4"
	}
}

func normalizeGradeCode(score, maxScore int, override *string) (string, error) {
	if override == nil || strings.TrimSpace(*override) == "" {
		return GradeCodeForScore(score, maxScore), nil
	}
	code := strings.TrimSpace(*override)
	switch code {
	case "ร", "0", "1", "1.5", "2", "2.5", "3", "3.5", "4":
		return code, nil
	default:
		return "", fmt.Errorf("invalid grade code")
	}
}

func (s *SubmissionService) List(ctx context.Context, assignmentID, studentID *uuid.UUID) ([]*model.Submission, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, grade_code, feedback, graded_by, graded_at, created_at, updated_at
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
		if err := rows.Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.GradeCode, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &sub)
	}
	return items, rows.Err()
}

func (s *SubmissionService) Get(ctx context.Context, id uuid.UUID) (*model.Submission, error) {
	var sub model.Submission
	err := s.db.QueryRow(ctx,
		`SELECT id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, grade_code, feedback, graded_by, graded_at, created_at, updated_at
		 FROM submissions WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.GradeCode, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
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
		`INSERT INTO submissions (assignment_id, student_id, content, file_urls, external_link, submitted_at, status)
		 VALUES ($1, $2, $3, $4, $5, now(), 'submitted')
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, grade_code, feedback, graded_by, graded_at, created_at, updated_at`,
		aid, sid, req.Content, req.FileURLs, req.ExternalLink,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.GradeCode, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
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
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, grade_code, feedback, graded_by, graded_at, created_at, updated_at`,
		id, req.Content, req.FileURLs, req.ExternalLink,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.GradeCode, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
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

	var maxScore int
	err = s.db.QueryRow(ctx, `
		SELECT a.max_score
		FROM submissions s
		JOIN assignments a ON a.id = s.assignment_id
		WHERE s.id = $1 AND s.deleted_at IS NULL AND a.deleted_at IS NULL`, id).Scan(&maxScore)
	if err != nil {
		return nil, err
	}
	if req.Score > maxScore {
		return nil, fmt.Errorf("score cannot exceed max score")
	}
	gradeCode, err := normalizeGradeCode(req.Score, maxScore, req.GradeCode)
	if err != nil {
		return nil, err
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var sub model.Submission
	err = tx.QueryRow(ctx,
		`UPDATE submissions SET
			score = $2,
			grade_code = $3,
			feedback = $4,
			graded_by = $5,
			graded_at = now(),
			status = 'graded',
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, assignment_id, student_id, content, file_urls, external_link, submitted_at, status, score, grade_code, feedback, graded_by, graded_at, created_at, updated_at`,
		id, req.Score, gradeCode, req.Feedback, gb,
	).Scan(&sub.ID, &sub.AssignmentID, &sub.StudentID, &sub.Content, &sub.FileURLs, &sub.ExternalLink, &sub.SubmittedAt, &sub.Status, &sub.Score, &sub.GradeCode, &sub.Feedback, &sub.GradedBy, &sub.GradedAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(ctx,
		`INSERT INTO grades (student_id, item_type, item_id, score, max_score, grade_code, feedback, graded_by)
		 VALUES ($1, 'assignment', $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (student_id, item_type, item_id) DO UPDATE SET
		     score = EXCLUDED.score,
		     max_score = EXCLUDED.max_score,
		     grade_code = EXCLUDED.grade_code,
		     feedback = EXCLUDED.feedback,
		     graded_by = EXCLUDED.graded_by,
		     updated_at = now()`,
		sub.StudentID, sub.AssignmentID, req.Score, maxScore, gradeCode, req.Feedback, gb)
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &sub, nil
}
