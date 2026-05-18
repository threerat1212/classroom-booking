package service

import (
	"context"
	"time"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BookingService struct {
	db *pgxpool.Pool
}

func NewBookingService(db *pgxpool.Pool) *BookingService { return &BookingService{db: db} }

func (s *BookingService) List(ctx context.Context, q model.BookingListQuery) ([]*model.Booking, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at, requester_name, requester_email, requester_phone
		 FROM bookings
		 WHERE deleted_at IS NULL
		   AND (NULLIF($1, '')::uuid IS NULL OR room_id = NULLIF($1, '')::uuid)
		   AND ($2::timestamptz IS NULL OR start_time >= $2)
		   AND ($3::timestamptz IS NULL OR end_time <= $3)
		   AND ($4 = '' OR status = $4::booking_status)
		   AND (NULLIF($5, '')::uuid IS NULL OR requester_id = NULLIF($5, '')::uuid)
		 ORDER BY start_time DESC
		 LIMIT $6 OFFSET $7`,
		q.RoomID, q.From, q.To, q.Status, q.Requester, q.Limit, (q.Page-1)*q.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	bookings := make([]*model.Booking, 0)
	for rows.Next() {
		var b model.Booking
		if err := rows.Scan(&b.ID, &b.RoomID, &b.RequesterID, &b.ApproverID, &b.Title, &b.Description, &b.Purpose, &b.StartTime, &b.EndTime, &b.Status, &b.RejectionReason, &b.ApprovedAt, &b.CreatedAt, &b.UpdatedAt, &b.RequesterName, &b.RequesterEmail, &b.RequesterPhone); err != nil {
			return nil, err
		}
		bookings = append(bookings, &b)
	}
	return bookings, rows.Err()
}

func (s *BookingService) Get(ctx context.Context, id uuid.UUID) (*model.Booking, error) {
	var b model.Booking
	err := s.db.QueryRow(ctx,
		`SELECT id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at, requester_name, requester_email, requester_phone
		 FROM bookings WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&b.ID, &b.RoomID, &b.RequesterID, &b.ApproverID, &b.Title, &b.Description, &b.Purpose, &b.StartTime, &b.EndTime, &b.Status, &b.RejectionReason, &b.ApprovedAt, &b.CreatedAt, &b.UpdatedAt, &b.RequesterName, &b.RequesterEmail, &b.RequesterPhone)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BookingService) Create(ctx context.Context, req model.CreateBookingRequest, requesterID string) (*model.Booking, error) {
	reqUUID, err := uuid.Parse(requesterID)
	if err != nil {
		return nil, err
	}
	rid, err := uuid.Parse(req.RoomID)
	if err != nil {
		return nil, err
	}
	overlaps, err := s.countOverlaps(ctx, rid, req.StartTime.Format(time.RFC3339), req.EndTime.Format(time.RFC3339), uuid.Nil)
	if err != nil {
		return nil, err
	}
	if overlaps > 0 {
		return nil, model.ErrBookingOverlap
	}
	var b model.Booking
	err = s.db.QueryRow(ctx,
		`INSERT INTO bookings (room_id, requester_id, title, description, purpose, start_time, end_time)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at`,
		rid, reqUUID, req.Title, req.Description, req.Purpose, req.StartTime, req.EndTime,
	).Scan(&b.ID, &b.RoomID, &b.RequesterID, &b.ApproverID, &b.Title, &b.Description, &b.Purpose, &b.StartTime, &b.EndTime, &b.Status, &b.RejectionReason, &b.ApprovedAt, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BookingService) PublicCreate(ctx context.Context, req model.PublicCreateBookingRequest) (*model.Booking, error) {
	rid, err := uuid.Parse(req.RoomID)
	if err != nil {
		return nil, err
	}
	overlaps, err := s.countOverlaps(ctx, rid, req.StartTime.Format(time.RFC3339), req.EndTime.Format(time.RFC3339), uuid.Nil)
	if err != nil {
		return nil, err
	}
	if overlaps > 0 {
		return nil, model.ErrBookingOverlap
	}
	var b model.Booking
	err = s.db.QueryRow(ctx,
		`INSERT INTO bookings (room_id, title, description, purpose, start_time, end_time, requester_name, requester_email, requester_phone)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at, requester_name, requester_email, requester_phone`,
		rid, req.Title, req.Description, req.Purpose, req.StartTime, req.EndTime, req.RequesterName, req.RequesterEmail, req.RequesterPhone,
	).Scan(&b.ID, &b.RoomID, &b.RequesterID, &b.ApproverID, &b.Title, &b.Description, &b.Purpose, &b.StartTime, &b.EndTime, &b.Status, &b.RejectionReason, &b.ApprovedAt, &b.CreatedAt, &b.UpdatedAt, &b.RequesterName, &b.RequesterEmail, &b.RequesterPhone)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BookingService) Update(ctx context.Context, id uuid.UUID, req model.UpdateBookingRequest) (*model.Booking, error) {
	var b model.Booking
	err := s.db.QueryRow(ctx,
		`UPDATE bookings SET
			title = COALESCE($2, title),
			description = COALESCE($3, description),
			purpose = COALESCE($4, purpose),
			start_time = COALESCE($5, start_time),
			end_time = COALESCE($6, end_time),
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, rejection_reason, approved_at, created_at, updated_at, requester_name, requester_email, requester_phone`,
		id, req.Title, req.Description, req.Purpose, req.StartTime, req.EndTime,
	).Scan(&b.ID, &b.RoomID, &b.RequesterID, &b.ApproverID, &b.Title, &b.Description, &b.Purpose, &b.StartTime, &b.EndTime, &b.Status, &b.RejectionReason, &b.ApprovedAt, &b.CreatedAt, &b.UpdatedAt, &b.RequesterName, &b.RequesterEmail, &b.RequesterPhone)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BookingService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE bookings SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

func (s *BookingService) Approve(ctx context.Context, id uuid.UUID, approverID string) error {
	aid, err := uuid.Parse(approverID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(ctx,
		`UPDATE bookings SET status = 'approved', approver_id = $2, approved_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL`,
		id, aid)
	return err
}

func (s *BookingService) Reject(ctx context.Context, id uuid.UUID, approverID, reason string) error {
	aid, err := uuid.Parse(approverID)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(ctx,
		`UPDATE bookings SET status = 'rejected', approver_id = $2, rejection_reason = $3, updated_at = now() WHERE id = $1 AND deleted_at IS NULL`,
		id, aid, reason)
	return err
}

func (s *BookingService) countOverlaps(ctx context.Context, roomID uuid.UUID, start, end string, excludeID uuid.UUID) (int64, error) {
	var count int64
	zero := uuid.Nil
	if excludeID != uuid.Nil {
		zero = excludeID
	}
	err := s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM bookings WHERE room_id = $1 AND deleted_at IS NULL AND status IN ('pending'::booking_status,'approved'::booking_status) AND id != $4 AND start_time < $3 AND end_time > $2`,
		roomID, start, end, zero,
	).Scan(&count)
	return count, err
}
