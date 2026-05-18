-- name: ListRooms :many
SELECT id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at
FROM rooms
WHERE deleted_at IS NULL
ORDER BY name;

-- name: GetRoomByID :one
SELECT id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at
FROM rooms
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetRoomByCode :one
SELECT id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at
FROM rooms
WHERE code = $1 AND deleted_at IS NULL;

-- name: CreateRoom :one
INSERT INTO rooms (name, code, room_type, capacity, floor, building, description, amenities, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at;

-- name: UpdateRoom :one
UPDATE rooms
SET
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
RETURNING id, name, code, room_type, capacity, floor, building, description, amenities, status, image_url, created_at, updated_at;

-- name: DeleteRoom :exec
UPDATE rooms SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;
