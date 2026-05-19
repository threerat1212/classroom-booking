package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"time"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AssignmentService struct {
	db *pgxpool.Pool
}

func NewAssignmentService(db *pgxpool.Pool) *AssignmentService { return &AssignmentService{db: db} }

func (s *AssignmentService) List(ctx context.Context, userID, role string) ([]*model.Assignment, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	where := `deleted_at IS NULL`
	args := []interface{}{}
	switch role {
	case "admin":
	case "teacher":
		where += ` AND teacher_id = $1`
		args = append(args, uid)
	case "student":
		where += ` AND status = 'published' AND EXISTS (
			SELECT 1 FROM classroom_members cm
			WHERE cm.room_id = assignments.room_id
			  AND cm.student_id = $1
		)`
		args = append(args, uid)
	default:
		return []*model.Assignment{}, nil
	}

	rows, err := s.db.Query(ctx,
		fmt.Sprintf(`SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
		 FROM assignments WHERE %s ORDER BY created_at DESC`, where), args...)
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

func (s *AssignmentService) Create(ctx context.Context, req model.CreateAssignmentRequest, teacherID, role string) (*model.Assignment, error) {
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
		if err := s.validateAssignmentClassroom(ctx, p, tid, role); err != nil {
			return nil, err
		}
		rid = &p
	}

	maxScore := req.MaxScore
	if maxScore == nil {
		defaultScore := 100
		maxScore = &defaultScore
	}

	var a model.Assignment
	err = s.db.QueryRow(ctx,
		`INSERT INTO assignments (teacher_id, room_id, title, description, assignment_type, max_score, due_date, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at`,
		tid, rid, req.Title, req.Description, req.AssignmentType, maxScore, req.DueDate, req.Status,
	).Scan(&a.ID, &a.TeacherID, &a.RoomID, &a.Title, &a.Description, &a.AssignmentType, &a.MaxScore, &a.DueDate, &a.Status, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AssignmentService) validateAssignmentClassroom(ctx context.Context, roomID, teacherID uuid.UUID, role string) error {
	var roomType string
	var ownerID *uuid.UUID
	err := s.db.QueryRow(ctx,
		`SELECT room_type, teacher_id FROM rooms WHERE id = $1 AND deleted_at IS NULL`,
		roomID,
	).Scan(&roomType, &ownerID)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.ErrNotFound
	}
	if err != nil {
		return err
	}
	if roomType != "classroom" {
		return fmt.Errorf("%w: selected room must be a classroom", model.ErrValidation)
	}
	if role != "admin" && (ownerID == nil || *ownerID != teacherID) {
		return fmt.Errorf("%w: classroom is not owned by this teacher", model.ErrForbidden)
	}
	return nil
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

func (s *AssignmentService) Gradebook(ctx context.Context, id uuid.UUID, teacherID, role string) ([]*model.AssignmentGradebookRow, error) {
	assignment, err := s.assignmentForGradebook(ctx, id, teacherID, role)
	if err != nil {
		return nil, err
	}

	if assignment.RoomID != nil {
		return s.gradebookForClassroomAssignment(ctx, id, *assignment.RoomID, assignment.MaxScore)
	}
	return s.gradebookForOpenAssignment(ctx, id, assignment.MaxScore)
}

func (s *AssignmentService) ExportGradebookXLSX(ctx context.Context, id uuid.UUID, teacherID, role string, w io.Writer) error {
	assignment, err := s.assignmentForGradebook(ctx, id, teacherID, role)
	if err != nil {
		return err
	}
	rows, err := s.Gradebook(ctx, id, teacherID, role)
	if err != nil {
		return err
	}

	data := [][]string{{
		"Student Name", "Email", "Status", "Score", "Max Score", "Percent", "Grade", "Submitted At", "Graded At", "Feedback",
	}}
	for _, row := range rows {
		score := ""
		if row.Score != nil {
			score = fmt.Sprintf("%d", *row.Score)
		}
		percent := ""
		if row.Percent != nil {
			percent = fmt.Sprintf("%.2f%%", *row.Percent)
		}
		data = append(data, []string{
			row.StudentName,
			row.StudentEmail,
			row.Status,
			score,
			fmt.Sprintf("%d", row.MaxScore),
			percent,
			row.GradeCode,
			formatTime(row.SubmittedAt),
			formatTime(row.GradedAt),
			deref(row.Feedback),
		})
	}
	return WriteSimpleXLSX(w, assignment.Title, data)
}

func (s *AssignmentService) assignmentForGradebook(ctx context.Context, id uuid.UUID, teacherID, role string) (*model.Assignment, error) {
	var assignment model.Assignment
	err := s.db.QueryRow(ctx,
		`SELECT id, teacher_id, room_id, title, description, assignment_type, max_score, due_date, status, created_at, updated_at
		 FROM assignments
		 WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&assignment.ID, &assignment.TeacherID, &assignment.RoomID, &assignment.Title, &assignment.Description, &assignment.AssignmentType, &assignment.MaxScore, &assignment.DueDate, &assignment.Status, &assignment.CreatedAt, &assignment.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if role == "admin" {
		return &assignment, nil
	}
	tid, err := uuid.Parse(teacherID)
	if err != nil {
		return nil, err
	}
	if assignment.TeacherID != tid {
		return nil, model.ErrForbidden
	}
	return &assignment, nil
}

func (s *AssignmentService) gradebookForClassroomAssignment(ctx context.Context, assignmentID, roomID uuid.UUID, maxScore *int) ([]*model.AssignmentGradebookRow, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, u.email,
		       sub.id, COALESCE(sub.status::text, 'missing'), sub.score, sub.grade_code, sub.feedback, sub.submitted_at, sub.graded_at
		FROM classroom_members cm
		JOIN users u ON u.id = cm.student_id AND u.deleted_at IS NULL
		LEFT JOIN submissions sub ON sub.assignment_id = $1 AND sub.student_id = u.id AND sub.deleted_at IS NULL
		WHERE cm.room_id = $2
		ORDER BY u.full_name`, assignmentID, roomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanGradebookRows(rows, valueOrDefault(maxScore, 100))
}

func (s *AssignmentService) gradebookForOpenAssignment(ctx context.Context, assignmentID uuid.UUID, maxScore *int) ([]*model.AssignmentGradebookRow, error) {
	rows, err := s.db.Query(ctx, `
		SELECT u.id, u.full_name, u.email,
		       sub.id, sub.status, sub.score, sub.grade_code, sub.feedback, sub.submitted_at, sub.graded_at
		FROM submissions sub
		JOIN users u ON u.id = sub.student_id AND u.deleted_at IS NULL
		WHERE sub.assignment_id = $1 AND sub.deleted_at IS NULL
		ORDER BY u.full_name`, assignmentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanGradebookRows(rows, valueOrDefault(maxScore, 100))
}

type gradebookScanner interface {
	Scan(dest ...any) error
	Next() bool
	Err() error
}

func scanGradebookRows(rows gradebookScanner, maxScore int) ([]*model.AssignmentGradebookRow, error) {
	items := make([]*model.AssignmentGradebookRow, 0)
	for rows.Next() {
		var row model.AssignmentGradebookRow
		var gradeCode *string
		if err := rows.Scan(&row.StudentID, &row.StudentName, &row.StudentEmail, &row.SubmissionID, &row.Status, &row.Score, &gradeCode, &row.Feedback, &row.SubmittedAt, &row.GradedAt); err != nil {
			return nil, err
		}
		row.MaxScore = maxScore
		row.GradeCode = "ร"
		if row.Score != nil {
			percent := float64(*row.Score) / float64(maxScore) * 100
			row.Percent = &percent
			row.GradeCode = GradeCodeForScore(*row.Score, maxScore)
		}
		if gradeCode != nil && *gradeCode != "" {
			row.GradeCode = *gradeCode
		}
		items = append(items, &row)
	}
	return items, rows.Err()
}

func valueOrDefault(value *int, fallback int) int {
	if value == nil || *value <= 0 {
		return fallback
	}
	return *value
}

func formatTime(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.Format(time.RFC3339)
}
