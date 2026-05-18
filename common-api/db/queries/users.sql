-- name: ListUsers :many
SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetUserByID :one
SELECT id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT id, email, password_hash, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at
FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name, role, student_id, employee_id, department, phone)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at;

-- name: UpdateUser :one
UPDATE users
SET
    full_name = COALESCE($2, full_name),
    role = COALESCE($3, role),
    student_id = COALESCE($4, student_id),
    employee_id = COALESCE($5, employee_id),
    department = COALESCE($6, department),
    phone = COALESCE($7, phone),
    status = COALESCE($8, status),
    updated_at = now()
WHERE id = $1 AND deleted_at IS NULL
RETURNING id, email, full_name, role, student_id, employee_id, department, phone, avatar_url, status, last_login_at, created_at, updated_at;

-- name: DeleteUser :exec
UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateLastLogin :exec
UPDATE users SET last_login_at = now() WHERE id = $1;
