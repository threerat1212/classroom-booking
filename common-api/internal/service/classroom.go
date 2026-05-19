package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClassroomService struct {
	db *pgxpool.Pool
}

func NewClassroomService(db *pgxpool.Pool) *ClassroomService {
	return &ClassroomService{db: db}
}

func (s *ClassroomService) List(ctx context.Context, userID, role string) ([]*model.Classroom, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	const selectClassrooms = `
		SELECT r.id, r.name, r.code, r.capacity, r.description, r.teacher_id, u.full_name,
		       r.join_code, COUNT(cm.student_id)::bigint AS student_count, %s AS joined_at,
		       r.created_at, r.updated_at
		FROM rooms r
		LEFT JOIN users u ON u.id = r.teacher_id
		LEFT JOIN classroom_members cm ON cm.room_id = r.id
		%s
		WHERE r.deleted_at IS NULL
		  AND r.room_type = 'classroom'
		  %s
		GROUP BY r.id, u.full_name %s
		ORDER BY r.name`

	switch role {
	case "admin":
		return s.queryClassrooms(ctx, fmt.Sprintf(selectClassrooms, "NULL::timestamptz", "", "", ""))
	case "teacher":
		return s.queryClassrooms(ctx, fmt.Sprintf(selectClassrooms, "NULL::timestamptz", "", "AND r.teacher_id = $1", ""), uid)
	case "student":
		return s.queryClassrooms(ctx, fmt.Sprintf(selectClassrooms, "my_membership.joined_at", "JOIN classroom_members my_membership ON my_membership.room_id = r.id AND my_membership.student_id = $1", "", ", my_membership.joined_at"), uid)
	default:
		return []*model.Classroom{}, nil
	}
}

func (s *ClassroomService) Create(ctx context.Context, req model.CreateClassroomRequest, teacherID string) (*model.Classroom, error) {
	tid, err := uuid.Parse(teacherID)
	if err != nil {
		return nil, err
	}

	joinCode, err := s.uniqueJoinCode(ctx)
	if err != nil {
		return nil, err
	}

	capacity := req.Capacity
	if capacity <= 0 {
		capacity = 30
	}

	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		code = "CLS-" + joinCode
	}

	var classroom model.Classroom
	err = s.db.QueryRow(ctx, `
		INSERT INTO rooms (name, code, room_type, capacity, description, status, teacher_id, join_code)
		VALUES ($1, $2, 'classroom', $3, $4, 'available', $5, $6)
		RETURNING id, name, code, capacity, description, teacher_id,
		          (SELECT full_name FROM users WHERE id = $5),
		          join_code, 0::bigint, NULL::timestamptz, created_at, updated_at`,
		strings.TrimSpace(req.Name), code, capacity, req.Description, tid, joinCode,
	).Scan(&classroom.ID, &classroom.Name, &classroom.Code, &classroom.Capacity, &classroom.Description, &classroom.TeacherID, &classroom.TeacherName, &classroom.JoinCode, &classroom.StudentCount, &classroom.JoinedAt, &classroom.CreatedAt, &classroom.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &classroom, nil
}

func (s *ClassroomService) Join(ctx context.Context, studentID string, req model.JoinClassroomRequest) (*model.Classroom, error) {
	sid, err := uuid.Parse(studentID)
	if err != nil {
		return nil, err
	}

	joinCode := strings.ToUpper(strings.TrimSpace(req.JoinCode))
	var classroomID uuid.UUID
	err = s.db.QueryRow(ctx, `
		SELECT id
		FROM rooms
		WHERE deleted_at IS NULL
		  AND room_type = 'classroom'
		  AND lower(join_code) = lower($1)`,
		joinCode,
	).Scan(&classroomID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, model.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	_, err = s.db.Exec(ctx, `
		INSERT INTO classroom_members (room_id, student_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`,
		classroomID, sid,
	)
	if err != nil {
		return nil, err
	}

	return s.GetForStudent(ctx, classroomID, sid)
}

func (s *ClassroomService) Get(ctx context.Context, classroomID uuid.UUID, userID, role string) (*model.Classroom, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	switch role {
	case "admin":
		items, err := s.queryClassrooms(ctx, `
			SELECT r.id, r.name, r.code, r.capacity, r.description, r.teacher_id, u.full_name,
			       r.join_code, COUNT(cm.student_id)::bigint AS student_count, NULL::timestamptz AS joined_at,
			       r.created_at, r.updated_at
			FROM rooms r
			LEFT JOIN users u ON u.id = r.teacher_id
			LEFT JOIN classroom_members cm ON cm.room_id = r.id
			WHERE r.id = $1 AND r.deleted_at IS NULL AND r.room_type = 'classroom'
			GROUP BY r.id, u.full_name`, classroomID)
		if err != nil {
			return nil, err
		}
		if len(items) == 0 {
			return nil, model.ErrNotFound
		}
		return items[0], nil
	case "teacher":
		items, err := s.queryClassrooms(ctx, `
			SELECT r.id, r.name, r.code, r.capacity, r.description, r.teacher_id, u.full_name,
			       r.join_code, COUNT(cm.student_id)::bigint AS student_count, NULL::timestamptz AS joined_at,
			       r.created_at, r.updated_at
			FROM rooms r
			LEFT JOIN users u ON u.id = r.teacher_id
			LEFT JOIN classroom_members cm ON cm.room_id = r.id
			WHERE r.id = $1 AND r.teacher_id = $2 AND r.deleted_at IS NULL AND r.room_type = 'classroom'
			GROUP BY r.id, u.full_name`, classroomID, uid)
		if err != nil {
			return nil, err
		}
		if len(items) == 0 {
			return nil, model.ErrNotFound
		}
		return items[0], nil
	case "student":
		return s.GetForStudent(ctx, classroomID, uid)
	default:
		return nil, model.ErrForbidden
	}
}

func (s *ClassroomService) GetForStudent(ctx context.Context, classroomID, studentID uuid.UUID) (*model.Classroom, error) {
	rows, err := s.db.Query(ctx, `
		SELECT r.id, r.name, r.code, r.capacity, r.description, r.teacher_id, u.full_name,
		       r.join_code, COUNT(cm.student_id)::bigint AS student_count, my_membership.joined_at,
		       r.created_at, r.updated_at
		FROM rooms r
		JOIN classroom_members my_membership ON my_membership.room_id = r.id AND my_membership.student_id = $2
		LEFT JOIN users u ON u.id = r.teacher_id
		LEFT JOIN classroom_members cm ON cm.room_id = r.id
		WHERE r.id = $1
		  AND r.deleted_at IS NULL
		  AND r.room_type = 'classroom'
		GROUP BY r.id, u.full_name, my_membership.joined_at`,
		classroomID, studentID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items, err := scanClassrooms(rows)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, model.ErrNotFound
	}
	return items[0], nil
}

func (s *ClassroomService) ListMaterials(ctx context.Context, classroomID uuid.UUID, userID, role string) ([]*model.LearningMaterial, error) {
	if _, err := s.Get(ctx, classroomID, userID, role); err != nil {
		return nil, err
	}

	publishedFilter := ""
	if role == "student" {
		publishedFilter = "AND is_published = true"
	}

	rows, err := s.db.Query(ctx, fmt.Sprintf(`
		SELECT id, classroom_id, teacher_id, title, description, material_type, content, url,
		       file_urls, sort_order, is_published, created_at, updated_at
		FROM learning_materials
		WHERE classroom_id = $1 AND deleted_at IS NULL %s
		ORDER BY sort_order ASC, created_at DESC`, publishedFilter), classroomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*model.LearningMaterial, 0)
	for rows.Next() {
		var item model.LearningMaterial
		if err := rows.Scan(&item.ID, &item.ClassroomID, &item.TeacherID, &item.Title, &item.Description, &item.MaterialType, &item.Content, &item.URL, &item.FileURLs, &item.SortOrder, &item.IsPublished, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}
	return items, rows.Err()
}

func (s *ClassroomService) CreateMaterial(ctx context.Context, classroomID uuid.UUID, userID, role string, req model.CreateLearningMaterialRequest) (*model.LearningMaterial, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	classroom, err := s.Get(ctx, classroomID, userID, role)
	if err != nil {
		return nil, err
	}
	if role != "admin" && (classroom.TeacherID == nil || *classroom.TeacherID != uid) {
		return nil, model.ErrForbidden
	}

	isPublished := true
	if req.IsPublished != nil {
		isPublished = *req.IsPublished
	}
	var description *string
	if strings.TrimSpace(req.Description) != "" {
		v := strings.TrimSpace(req.Description)
		description = &v
	}
	var content *string
	if strings.TrimSpace(req.Content) != "" {
		v := strings.TrimSpace(req.Content)
		content = &v
	}
	var url *string
	if strings.TrimSpace(req.URL) != "" {
		v := strings.TrimSpace(req.URL)
		url = &v
	}

	var item model.LearningMaterial
	err = s.db.QueryRow(ctx, `
		INSERT INTO learning_materials (classroom_id, teacher_id, title, description, material_type, content, url, file_urls, sort_order, is_published)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, classroom_id, teacher_id, title, description, material_type, content, url, file_urls, sort_order, is_published, created_at, updated_at`,
		classroomID, uid, strings.TrimSpace(req.Title), description, req.MaterialType, content, url, req.FileURLs, req.SortOrder, isPublished,
	).Scan(&item.ID, &item.ClassroomID, &item.TeacherID, &item.Title, &item.Description, &item.MaterialType, &item.Content, &item.URL, &item.FileURLs, &item.SortOrder, &item.IsPublished, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *ClassroomService) DeleteMaterial(ctx context.Context, classroomID, materialID uuid.UUID, userID, role string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return err
	}
	classroom, err := s.Get(ctx, classroomID, userID, role)
	if err != nil {
		return err
	}
	if role != "admin" && (classroom.TeacherID == nil || *classroom.TeacherID != uid) {
		return model.ErrForbidden
	}

	tag, err := s.db.Exec(ctx, `
		UPDATE learning_materials
		SET deleted_at = now(), updated_at = now()
		WHERE id = $1 AND classroom_id = $2 AND deleted_at IS NULL`, materialID, classroomID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return model.ErrNotFound
	}
	return nil
}

func (s *ClassroomService) queryClassrooms(ctx context.Context, sql string, args ...interface{}) ([]*model.Classroom, error) {
	rows, err := s.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanClassrooms(rows)
}

func scanClassrooms(rows pgx.Rows) ([]*model.Classroom, error) {
	items := make([]*model.Classroom, 0)
	for rows.Next() {
		var c model.Classroom
		if err := rows.Scan(&c.ID, &c.Name, &c.Code, &c.Capacity, &c.Description, &c.TeacherID, &c.TeacherName, &c.JoinCode, &c.StudentCount, &c.JoinedAt, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, &c)
	}
	return items, rows.Err()
}

func (s *ClassroomService) uniqueJoinCode(ctx context.Context) (string, error) {
	for attempt := 0; attempt < 8; attempt++ {
		code, err := randomJoinCode(6)
		if err != nil {
			return "", err
		}

		var exists bool
		err = s.db.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM rooms WHERE lower(join_code) = lower($1) AND deleted_at IS NULL)`, code).Scan(&exists)
		if err != nil {
			return "", err
		}
		if !exists {
			return code, nil
		}
	}
	return "", fmt.Errorf("could not generate a unique join code")
}

func randomJoinCode(length int) (string, error) {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	var b strings.Builder
	b.Grow(length)
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		b.WriteByte(alphabet[n.Int64()])
	}
	return b.String(), nil
}
