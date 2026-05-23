package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RewardService struct {
	db *pgxpool.Pool
}

func NewRewardService(db *pgxpool.Pool) *RewardService {
	return &RewardService{db: db}
}

type rewardExecutor interface {
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
}

func (s *RewardService) ListShop(ctx context.Context, userID uuid.UUID) (*model.RewardShopSummary, error) {
	level, gold, err := s.getUserEconomy(ctx, s.db, userID)
	if err != nil {
		return nil, err
	}

	rewards, err := s.listRewardsWithState(ctx, userID, level, gold)
	if err != nil {
		return nil, err
	}

	history, err := s.ListRedemptions(ctx, userID, "student", "")
	if err != nil {
		return nil, err
	}
	if len(history) > 6 {
		history = history[:6]
	}

	return &model.RewardShopSummary{
		GoldBalance: gold,
		Level:       level,
		Rewards:     rewards,
		History:     history,
	}, nil
}

func (s *RewardService) listRewardsWithState(ctx context.Context, userID uuid.UUID, level, gold int) ([]*model.RewardItem, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, code, name, description, category, reward_type, icon, price_gold,
		       required_level, stock_limit, weekly_limit, max_per_user, requires_approval,
		       is_active, sort_order, created_at
		FROM reward_items
		WHERE deleted_at IS NULL
		ORDER BY sort_order, price_gold`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rewards := make([]*model.RewardItem, 0)
	for rows.Next() {
		var reward model.RewardItem
		if err := rows.Scan(
			&reward.ID, &reward.Code, &reward.Name, &reward.Description, &reward.Category,
			&reward.RewardType, &reward.Icon, &reward.PriceGold, &reward.RequiredLevel,
			&reward.StockLimit, &reward.WeeklyLimit, &reward.MaxPerUser, &reward.RequiresApproval,
			&reward.IsActive, &reward.SortOrder, &reward.CreatedAt,
		); err != nil {
			return nil, err
		}
		if err := s.applyRewardState(ctx, &reward, userID, level, gold); err != nil {
			return nil, err
		}
		rewards = append(rewards, &reward)
	}
	return rewards, rows.Err()
}

func (s *RewardService) applyRewardState(ctx context.Context, reward *model.RewardItem, userID uuid.UUID, level, gold int) error {
	if err := s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE user_id = $2 AND status <> 'rejected')::int AS user_count,
			COUNT(*) FILTER (
				WHERE user_id = $2
				  AND status <> 'rejected'
				  AND requested_at >= date_trunc('week', now())
			)::int AS week_count,
			COUNT(*) FILTER (WHERE status <> 'rejected')::int AS total_count
		FROM reward_redemptions
		WHERE reward_id = $1`, reward.ID, userID,
	).Scan(&reward.RedeemedCount, &reward.RedeemedThisWeek, &reward.TotalRedemptions); err != nil {
		return err
	}

	reward.IsUnlocked = reward.IsActive && level >= reward.RequiredLevel
	reward.CanRedeem = reward.IsUnlocked && gold >= reward.PriceGold
	var reason string
	switch {
	case !reward.IsActive:
		reason = "reward is closed"
	case level < reward.RequiredLevel:
		reason = fmt.Sprintf("requires level %d", reward.RequiredLevel)
	case reward.MaxPerUser != nil && reward.RedeemedCount >= *reward.MaxPerUser:
		reason = "already redeemed"
	case reward.WeeklyLimit != nil && reward.RedeemedThisWeek >= *reward.WeeklyLimit:
		reason = "weekly limit reached"
	case reward.StockLimit != nil && reward.TotalRedemptions >= *reward.StockLimit:
		reason = "out of stock"
	case gold < reward.PriceGold:
		reason = "not enough gold"
	}
	if reason != "" {
		reward.CanRedeem = false
		reward.BlockedReason = &reason
	}
	return nil
}

func (s *RewardService) Redeem(ctx context.Context, userID uuid.UUID, rewardCode string) (*model.RedeemRewardResponse, error) {
	rewardCode = strings.TrimSpace(rewardCode)
	if rewardCode == "" {
		return nil, model.ErrValidation
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	level, gold, err := s.getUserEconomyForUpdate(ctx, tx, userID)
	if err != nil {
		return nil, err
	}

	var reward model.RewardItem
	if err := tx.QueryRow(ctx, `
		SELECT id, code, name, description, category, reward_type, icon, price_gold,
		       required_level, stock_limit, weekly_limit, max_per_user, requires_approval,
		       is_active, sort_order, created_at
		FROM reward_items
		WHERE code = $1 AND deleted_at IS NULL
		FOR UPDATE`, rewardCode,
	).Scan(
		&reward.ID, &reward.Code, &reward.Name, &reward.Description, &reward.Category,
		&reward.RewardType, &reward.Icon, &reward.PriceGold, &reward.RequiredLevel,
		&reward.StockLimit, &reward.WeeklyLimit, &reward.MaxPerUser, &reward.RequiresApproval,
		&reward.IsActive, &reward.SortOrder, &reward.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	if err := s.applyRewardStateTx(ctx, tx, &reward, userID, level, gold); err != nil {
		return nil, err
	}
	if !reward.CanRedeem {
		return nil, model.ErrForbidden
	}

	nextGold := gold
	if reward.PriceGold > 0 {
		if err := tx.QueryRow(ctx, `
			UPDATE users
			SET gold_balance = gold_balance - $2, updated_at = now()
			WHERE id = $1 AND deleted_at IS NULL
			RETURNING gold_balance`, userID, reward.PriceGold).Scan(&nextGold); err != nil {
			return nil, err
		}
		_, _ = tx.Exec(ctx, `
			INSERT INTO gold_history (user_id, action, gold_amount, balance_after, description, reference_type, reference_id)
			VALUES ($1, 'reward_redeem', $2, $3, $4, 'reward_item', $5)`,
			userID, -reward.PriceGold, nextGold, fmt.Sprintf("Redeemed %s", reward.Name), reward.ID)
	}

	status := "fulfilled"
	if reward.RequiresApproval {
		status = "pending"
	}

	var redemption model.RewardRedemption
	if err := tx.QueryRow(ctx, `
		INSERT INTO reward_redemptions (reward_id, user_id, gold_spent, status)
		VALUES ($1, $2, $3, $4)
		RETURNING id, reward_id, user_id, gold_spent, status, note, requested_at, resolved_at, resolved_by`,
		reward.ID, userID, reward.PriceGold, status,
	).Scan(&redemption.ID, &redemption.RewardID, &redemption.UserID, &redemption.GoldSpent, &redemption.Status, &redemption.Note, &redemption.RequestedAt, &redemption.ResolvedAt, &redemption.ResolvedBy); err != nil {
		return nil, err
	}
	redemption.RewardCode = reward.Code
	redemption.RewardName = reward.Name
	redemption.RewardCategory = reward.Category

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &model.RedeemRewardResponse{GoldBalance: nextGold, Redemption: &redemption}, nil
}

func (s *RewardService) applyRewardStateTx(ctx context.Context, tx pgx.Tx, reward *model.RewardItem, userID uuid.UUID, level, gold int) error {
	if err := tx.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE user_id = $2 AND status <> 'rejected')::int AS user_count,
			COUNT(*) FILTER (
				WHERE user_id = $2
				  AND status <> 'rejected'
				  AND requested_at >= date_trunc('week', now())
			)::int AS week_count,
			COUNT(*) FILTER (WHERE status <> 'rejected')::int AS total_count
		FROM reward_redemptions
		WHERE reward_id = $1`, reward.ID, userID,
	).Scan(&reward.RedeemedCount, &reward.RedeemedThisWeek, &reward.TotalRedemptions); err != nil {
		return err
	}

	reward.IsUnlocked = reward.IsActive && level >= reward.RequiredLevel
	reward.CanRedeem = reward.IsUnlocked && gold >= reward.PriceGold
	switch {
	case !reward.IsActive:
		reward.CanRedeem = false
	case level < reward.RequiredLevel:
		reward.CanRedeem = false
	case reward.MaxPerUser != nil && reward.RedeemedCount >= *reward.MaxPerUser:
		reward.CanRedeem = false
	case reward.WeeklyLimit != nil && reward.RedeemedThisWeek >= *reward.WeeklyLimit:
		reward.CanRedeem = false
	case reward.StockLimit != nil && reward.TotalRedemptions >= *reward.StockLimit:
		reward.CanRedeem = false
	case gold < reward.PriceGold:
		reward.CanRedeem = false
	}
	return nil
}

func (s *RewardService) ListRedemptions(ctx context.Context, userID uuid.UUID, role, status string) ([]*model.RewardRedemption, error) {
	status = strings.TrimSpace(status)
	args := []interface{}{}
	where := "WHERE 1=1"
	if role == "student" {
		args = append(args, userID)
		where += fmt.Sprintf(" AND rr.user_id = $%d", len(args))
	}
	if status != "" {
		args = append(args, status)
		where += fmt.Sprintf(" AND rr.status = $%d", len(args))
	}

	rows, err := s.db.Query(ctx, fmt.Sprintf(`
		SELECT rr.id, rr.reward_id, rr.user_id, ri.code, ri.name, ri.category,
		       u.full_name, u.email,
		       rr.gold_spent, rr.status, rr.note, rr.requested_at, rr.resolved_at, rr.resolved_by
		FROM reward_redemptions rr
		JOIN reward_items ri ON ri.id = rr.reward_id
		JOIN users u ON u.id = rr.user_id
		%s
		ORDER BY rr.requested_at DESC
		LIMIT 100`, where), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*model.RewardRedemption, 0)
	for rows.Next() {
		var item model.RewardRedemption
		if err := rows.Scan(
			&item.ID, &item.RewardID, &item.UserID, &item.RewardCode, &item.RewardName,
			&item.RewardCategory, &item.StudentName, &item.StudentEmail,
			&item.GoldSpent, &item.Status, &item.Note,
			&item.RequestedAt, &item.ResolvedAt, &item.ResolvedBy,
		); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}
	return items, rows.Err()
}

func (s *RewardService) UpdateRedemption(ctx context.Context, id, resolvedBy uuid.UUID, status, note string) (*model.RewardRedemption, error) {
	status = strings.TrimSpace(status)
	if status == "" {
		return nil, model.ErrValidation
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var currentStatus string
	var userID uuid.UUID
	var goldSpent int
	if err := tx.QueryRow(ctx, `
		SELECT status, user_id, gold_spent
		FROM reward_redemptions
		WHERE id = $1
		FOR UPDATE`, id).Scan(&currentStatus, &userID, &goldSpent); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	if currentStatus == "rejected" && status != "rejected" {
		return nil, model.ErrConflict
	}

	if status == "rejected" && currentStatus != "rejected" && goldSpent > 0 {
		var nextGold int
		if err := tx.QueryRow(ctx, `
			UPDATE users
			SET gold_balance = gold_balance + $2, updated_at = now()
			WHERE id = $1 AND deleted_at IS NULL
			RETURNING gold_balance`, userID, goldSpent).Scan(&nextGold); err != nil {
			return nil, err
		}
		_, _ = tx.Exec(ctx, `
			INSERT INTO gold_history (user_id, action, gold_amount, balance_after, description, reference_type, reference_id)
			VALUES ($1, 'reward_refund', $2, $3, 'Reward request rejected', 'reward_redemption', $4)`,
			userID, goldSpent, nextGold, id)
	}

	var notePtr *string
	if strings.TrimSpace(note) != "" {
		v := strings.TrimSpace(note)
		notePtr = &v
	}

	var item model.RewardRedemption
	if err := tx.QueryRow(ctx, `
		UPDATE reward_redemptions
		SET status = $2, note = COALESCE($3::text, note), resolved_at = now(), resolved_by = $4
		WHERE id = $1
		RETURNING id, reward_id, user_id, gold_spent, status, note, requested_at, resolved_at, resolved_by`,
		id, status, notePtr, resolvedBy,
	).Scan(&item.ID, &item.RewardID, &item.UserID, &item.GoldSpent, &item.Status, &item.Note, &item.RequestedAt, &item.ResolvedAt, &item.ResolvedBy); err != nil {
		return nil, err
	}
	if err := tx.QueryRow(ctx, `
		SELECT ri.code, ri.name, ri.category, u.full_name, u.email
		FROM reward_items ri
		JOIN users u ON u.id = $2
		WHERE ri.id = $1`, item.RewardID, item.UserID).Scan(&item.RewardCode, &item.RewardName, &item.RewardCategory, &item.StudentName, &item.StudentEmail); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *RewardService) getUserEconomy(ctx context.Context, exec rewardExecutor, userID uuid.UUID) (int, int, error) {
	var level, gold int
	if err := exec.QueryRow(ctx, `
		SELECT level, gold_balance
		FROM users
		WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&level, &gold); err != nil {
		return 0, 0, err
	}
	return level, gold, nil
}

func (s *RewardService) getUserEconomyForUpdate(ctx context.Context, tx pgx.Tx, userID uuid.UUID) (int, int, error) {
	var level, gold int
	if err := tx.QueryRow(ctx, `
		SELECT level, gold_balance
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
		FOR UPDATE`, userID).Scan(&level, &gold); err != nil {
		return 0, 0, err
	}
	return level, gold, nil
}
