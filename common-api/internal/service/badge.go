package service

import (
	"context"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BadgeService struct {
	db *pgxpool.Pool
}

func NewBadgeService(db *pgxpool.Pool) *BadgeService { return &BadgeService{db: db} }

func (s *BadgeService) List(ctx context.Context) ([]*model.Badge, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, name, description, icon_url, criteria, created_at
		 FROM badges WHERE deleted_at IS NULL ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.Badge, 0)
	for rows.Next() {
		var b model.Badge
		if err := rows.Scan(&b.ID, &b.Name, &b.Description, &b.IconURL, &b.Criteria, &b.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, &b)
	}
	return items, rows.Err()
}

func (s *BadgeService) Get(ctx context.Context, id uuid.UUID) (*model.Badge, error) {
	var b model.Badge
	err := s.db.QueryRow(ctx,
		`SELECT id, name, description, icon_url, criteria, created_at
		 FROM badges WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&b.ID, &b.Name, &b.Description, &b.IconURL, &b.Criteria, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BadgeService) Create(ctx context.Context, req model.CreateBadgeRequest) (*model.Badge, error) {
	var b model.Badge
	err := s.db.QueryRow(ctx,
		`INSERT INTO badges (name, description, icon_url, criteria)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, description, icon_url, criteria, created_at`,
		req.Name, req.Description, req.IconURL, req.Criteria,
	).Scan(&b.ID, &b.Name, &b.Description, &b.IconURL, &b.Criteria, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (s *BadgeService) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(ctx, `UPDATE badges SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`, id)
	return err
}

func (s *BadgeService) ListStudentBadges(ctx context.Context, studentID uuid.UUID) ([]*model.StudentBadge, error) {
	rows, err := s.db.Query(ctx,
		`SELECT sb.id, sb.student_id, sb.badge_id, sb.awarded_at, sb.awarded_by, sb.context
		 FROM student_badges sb
		 JOIN badges b ON b.id = sb.badge_id
		 WHERE sb.student_id = $1 AND b.deleted_at IS NULL
		 ORDER BY sb.awarded_at DESC`, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]*model.StudentBadge, 0)
	for rows.Next() {
		var sb model.StudentBadge
		if err := rows.Scan(&sb.ID, &sb.StudentID, &sb.BadgeID, &sb.AwardedAt, &sb.AwardedBy, &sb.Context); err != nil {
			return nil, err
		}
		items = append(items, &sb)
	}
	return items, rows.Err()
}

func (s *BadgeService) Award(ctx context.Context, req model.AwardBadgeRequest, awardedBy string) (*model.StudentBadge, error) {
	sid, err := uuid.Parse(req.StudentID)
	if err != nil {
		return nil, err
	}
	bid, err := uuid.Parse(req.BadgeID)
	if err != nil {
		return nil, err
	}
	ab, err := uuid.Parse(awardedBy)
	if err != nil {
		return nil, err
	}
	var sb model.StudentBadge
	err = s.db.QueryRow(ctx,
		`INSERT INTO student_badges (student_id, badge_id, awarded_by, context)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, student_id, badge_id, awarded_at, awarded_by, context`,
		sid, bid, ab, req.Context,
	).Scan(&sb.ID, &sb.StudentID, &sb.BadgeID, &sb.AwardedAt, &sb.AwardedBy, &sb.Context)
	if err != nil {
		return nil, err
	}
	return &sb, nil
}
