package service

import (
	"context"
	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoomService struct {
	db *pgxpool.Pool
}

func NewRoomService(db *pgxpool.Pool) *RoomService { return &RoomService{db: db} }

func (s *RoomService) List(ctx context.Context) ([]*model.Room, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at
		 FROM rooms WHERE deleted_at IS NULL ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	rooms := make([]*model.Room, 0)
	for rows.Next() {
		var r model.Room
		if err := rows.Scan(&r.ID, &r.Name, &r.Code, &r.RoomType, &r.Capacity, &r.Floor, &r.Building, &r.Description, &r.Amenities, &r.Status, &r.ImageURL, &r.CreatedAt, &r.UpdatedAt); err != nil {
			return nil, err
		}
		rooms = append(rooms, &r)
	}
	return rooms, rows.Err()
}

func (s *RoomService) Get(ctx context.Context, id uuid.UUID) (*model.Room, error) {
	var r model.Room
	err := s.db.QueryRow(ctx,
		`SELECT id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at
		 FROM rooms WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&r.ID, &r.Name, &r.Code, &r.RoomType, &r.Capacity, &r.Floor, &r.Building, &r.Description, &r.Amenities, &r.Status, &r.ImageURL, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *RoomService) Create(ctx context.Context, req model.CreateRoomRequest) (*model.Room, error) {
	status := "available"
	if req.Status != nil {
		status = *req.Status
	}
	var r model.Room
	err := s.db.QueryRow(ctx,
		`INSERT INTO rooms (name, code, room_type, capacity, floor, building, description, amenities, status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at`,
		req.Name, req.Code, req.RoomType, req.Capacity, req.Floor, req.Building, req.Description, req.Amenities, status,
	).Scan(&r.ID, &r.Name, &r.Code, &r.RoomType, &r.Capacity, &r.Floor, &r.Building, &r.Description, &r.Amenities, &r.Status, &r.ImageURL, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *RoomService) Update(ctx context.Context, id uuid.UUID, req model.UpdateRoomRequest) (*model.Room, error) {
	var r model.Room
	err := s.db.QueryRow(ctx,
		`UPDATE rooms SET
			name = COALESCE($2, name),
			code = COALESCE($3, code),
			room_type = COALESCE($4, room_type),
			capacity = COALESCE($5, capacity),
			floor = COALESCE($6, floor),
			building = COALESCE($7, building),
			description = COALESCE($8, description),
			amenities = COALESCE($9, amenities),
			status = COALESCE($10, status),
			updated_at = now()
		 WHERE id = $1 AND deleted_at IS NULL
		 RETURNING id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at`,
		id, req.Name, req.Code, req.RoomType, req.Capacity, req.Floor, req.Building, req.Description, req.Amenities, req.Status,
	).Scan(&r.ID, &r.Name, &r.Code, &r.RoomType, &r.Capacity, &r.Floor, &r.Building, &r.Description, &r.Amenities, &r.Status, &r.ImageURL, &r.CreatedAt, &r.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (s *RoomService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE rooms SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}
