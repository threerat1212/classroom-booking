package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AttendanceService struct {
	db *pgxpool.Pool
}

func NewAttendanceService(db *pgxpool.Pool) *AttendanceService { return &AttendanceService{db: db} }

func (s *AttendanceService) ListSessions(ctx context.Context) ([]*model.AttendanceSession, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at
		 FROM attendance_sessions WHERE deleted_at IS NULL ORDER BY session_date DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.AttendanceSession, 0)
	for rows.Next() {
		var a model.AttendanceSession
		if err := rows.Scan(&a.ID, &a.RoomID, &a.TeacherID, &a.SessionDate, &a.StartTime, &a.EndTime, &a.Status, &a.QRCode, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &a)
	}
	return items, rows.Err()
}

func (s *AttendanceService) GetSession(ctx context.Context, id uuid.UUID) (*model.AttendanceSession, error) {
	var a model.AttendanceSession
	err := s.db.QueryRow(ctx,
		`SELECT id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at
		 FROM attendance_sessions WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&a.ID, &a.RoomID, &a.TeacherID, &a.SessionDate, &a.StartTime, &a.EndTime, &a.Status, &a.QRCode, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AttendanceService) CreateSession(ctx context.Context, req model.CreateAttendanceSessionRequest, teacherID string) (*model.AttendanceSession, error) {
	tid, err := uuid.Parse(teacherID)
	if err != nil {
		return nil, err
	}
	rid, err := uuid.Parse(req.RoomID)
	if err != nil {
		return nil, err
	}
	var a model.AttendanceSession
	title := req.Title
	if title == "" {
		title = "Attendance Session"
	}
	err = s.db.QueryRow(ctx,
		`INSERT INTO attendance_sessions (room_id, teacher_id, title, session_date, start_time, end_time, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, room_id, teacher_id, session_date, start_time, end_time, status, qr_code, created_at, updated_at`,
		rid, tid, title, req.SessionDate, req.StartTime, req.EndTime, req.Status,
	).Scan(&a.ID, &a.RoomID, &a.TeacherID, &a.SessionDate, &a.StartTime, &a.EndTime, &a.Status, &a.QRCode, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *AttendanceService) DeleteSession(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE attendance_sessions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

func (s *AttendanceService) ListRecords(ctx context.Context, sessionID, studentID *uuid.UUID) ([]*model.AttendanceRecord, error) {
	rows, err := s.db.Query(ctx,
		`SELECT
			ar.id, ar.session_id, ar.student_id, ar.status, ar.check_in_at, ar.check_out_at, ar.notes, ar.created_at, ar.updated_at,
			u.full_name as student_name, u.rank_title as student_title
		 FROM attendance_records ar
		 LEFT JOIN users u ON u.id = ar.student_id
		 WHERE ar.deleted_at IS NULL
		   AND ($1::uuid IS NULL OR ar.session_id = $1)
		   AND ($2::uuid IS NULL OR ar.student_id = $2)
		 ORDER BY ar.created_at DESC`, sessionID, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.AttendanceRecord, 0)
	for rows.Next() {
		var r model.AttendanceRecord
		if err := rows.Scan(
			&r.ID, &r.SessionID, &r.StudentID, &r.Status, &r.CheckInTime, &r.CheckOutTime, &r.Notes, &r.CreatedAt, &r.UpdatedAt,
			&r.StudentName, &r.StudentTitle,
		); err != nil {
			return nil, err
		}
		items = append(items, &r)
	}
	return items, rows.Err()
}

func (s *AttendanceService) UpsertRecord(ctx context.Context, req model.UpsertAttendanceRecordRequest, markedBy uuid.UUID) (*model.AttendanceRecord, error) {
	sid, err := uuid.Parse(req.SessionID)
	if err != nil {
		return nil, err
	}
	stid, err := uuid.Parse(req.StudentID)
	if err != nil {
		return nil, err
	}
	var r model.AttendanceRecord
	err = s.db.QueryRow(ctx,
		`INSERT INTO attendance_records (session_id, student_id, status, check_in_at, notes, marked_by)
		 VALUES ($1, $2, $3, COALESCE($4, now()), $5, $6)
		 ON CONFLICT (session_id, student_id) DO UPDATE SET
		     status = EXCLUDED.status,
		     check_in_at = COALESCE(EXCLUDED.check_in_at, attendance_records.check_in_at),
		     notes = EXCLUDED.notes,
		     marked_by = EXCLUDED.marked_by,
		     updated_at = now()
		 RETURNING id, session_id, student_id, status, check_in_at, check_out_at, notes, created_at, updated_at`,
		sid, stid, req.Status, nil, req.Notes, markedBy,
	).Scan(&r.ID, &r.SessionID, &r.StudentID, &r.Status, &r.CheckInTime, &r.CheckOutTime, &r.Notes, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}
