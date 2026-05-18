package service

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExportService struct {
	db *pgxpool.Pool
}

func NewExportService(db *pgxpool.Pool) *ExportService { return &ExportService{db: db} }

func (s *ExportService) ExportAttendanceCSV(ctx context.Context, roomID uuid.UUID, w io.Writer) error {
	writer := csv.NewWriter(w)
	defer writer.Flush()

	_ = writer.Write([]string{"Session ID", "Room ID", "Teacher ID", "Session Date", "Start Time", "End Time", "Status", "Student ID", "Check In", "Check Out", "Notes"})

	rows, err := s.db.Query(ctx,
		`SELECT s.id, s.room_id, s.teacher_id, s.session_date, s.start_time, s.end_time, s.status,
		        r.student_id, r.check_in_time, r.check_out_time, r.notes
		 FROM attendance_sessions s
		 LEFT JOIN attendance_records r ON r.session_id = s.id AND r.deleted_at IS NULL
		 WHERE s.deleted_at IS NULL AND ($1::uuid IS NULL OR s.room_id = $1)
		 ORDER BY s.session_date DESC, r.check_in_time`, roomID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var sid, rid, tid, stid, status, notes string
		var sdate, stime, etime, cin, cout *string
		if err := rows.Scan(&sid, &rid, &tid, &sdate, &stime, &etime, &status, &stid, &cin, &cout, &notes); err != nil {
			return err
		}
		_ = writer.Write([]string{sid, rid, tid, deref(sdate), deref(stime), deref(etime), status, stid, deref(cin), deref(cout), notes})
	}
	return rows.Err()
}

func (s *ExportService) ExportGradesCSV(ctx context.Context, studentID uuid.UUID, w io.Writer) error {
	writer := csv.NewWriter(w)
	defer writer.Flush()

	_ = writer.Write([]string{"Grade ID", "Student ID", "Item Type", "Item ID", "Score", "Max Score", "Feedback", "Graded By", "Created At"})

	rows, err := s.db.Query(ctx,
		`SELECT id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at
		 FROM grades
		 WHERE deleted_at IS NULL AND ($1::uuid IS NULL OR student_id = $1)
		 ORDER BY created_at DESC`, studentID)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var gid, sid, itype, iid, feedback, gby, cat string
		var score, maxScore int
		if err := rows.Scan(&gid, &sid, &itype, &iid, &score, &maxScore, &feedback, &gby, &cat); err != nil {
			return err
		}
		_ = writer.Write([]string{gid, sid, itype, iid, fmt.Sprintf("%d", score), fmt.Sprintf("%d", maxScore), feedback, gby, cat})
	}
	return rows.Err()
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
