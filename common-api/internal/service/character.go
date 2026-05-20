package service

import (
	"context"
	"errors"
	"fmt"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CharacterService struct {
	db *pgxpool.Pool
}

func NewCharacterService(db *pgxpool.Pool) *CharacterService {
	return &CharacterService{db: db}
}

var defaultEquippedItems = map[string]string{
	"hair":    "hair_novice",
	"hat":     "hat_none",
	"glasses": "glasses_none",
	"top":     "top_novice",
	"bottom":  "bottom_novice",
	"shoes":   "shoes_novice",
	"back":    "back_none",
	"aura":    "aura_none",
}

// GetCharacter fetches or initializes a student's character customization.
func (s *CharacterService) GetCharacter(ctx context.Context, userID uuid.UUID) (*model.UserCharacter, error) {
	var c model.UserCharacter
	err := s.db.QueryRow(ctx, `
		SELECT user_id, equipped_hair, equipped_hat, equipped_outfit, equipped_aura, updated_at
		FROM user_characters
		WHERE user_id = $1`, userID).Scan(&c.UserID, &c.EquippedHair, &c.EquippedHat, &c.EquippedOutfit, &c.EquippedAura, &c.UpdatedAt)

	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}

		defaultHair := "hair_novice"
		defaultHat := "hat_none"
		defaultOutfit := "outfit_novice"
		defaultAura := "aura_none"

		err = s.db.QueryRow(ctx, `
			INSERT INTO user_characters (user_id, equipped_hair, equipped_hat, equipped_outfit, equipped_aura)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING user_id, equipped_hair, equipped_hat, equipped_outfit, equipped_aura, updated_at`,
			userID, defaultHair, defaultHat, defaultOutfit, defaultAura).Scan(&c.UserID, &c.EquippedHair, &c.EquippedHat, &c.EquippedOutfit, &c.EquippedAura, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
	}

	if err := s.ensureDefaultEquippedItems(ctx, userID); err != nil {
		return nil, err
	}
	equipped, err := s.listEquippedItems(ctx, userID)
	if err != nil {
		return nil, err
	}
	c.EquippedItems = equipped
	return &c, nil
}

func (s *CharacterService) ensureDefaultEquippedItems(ctx context.Context, userID uuid.UUID) error {
	for slot, itemCode := range defaultEquippedItems {
		if _, err := s.db.Exec(ctx, `
			INSERT INTO user_equipped_items (user_id, slot, item_code)
			VALUES ($1, $2, $3)
			ON CONFLICT (user_id, slot) DO NOTHING`, userID, slot, itemCode); err != nil {
			return err
		}
	}
	return nil
}

func (s *CharacterService) listEquippedItems(ctx context.Context, userID uuid.UUID) (map[string]string, error) {
	rows, err := s.db.Query(ctx, `
		SELECT slot, item_code
		FROM user_equipped_items
		WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make(map[string]string)
	for rows.Next() {
		var slot, itemCode string
		if err := rows.Scan(&slot, &itemCode); err != nil {
			return nil, err
		}
		items[slot] = itemCode
	}
	return items, rows.Err()
}

func (s *CharacterService) GetGold(ctx context.Context, userID uuid.UUID) (int, error) {
	var gold int
	if err := s.db.QueryRow(ctx, `SELECT gold_balance FROM users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&gold); err != nil {
		return 0, err
	}
	return gold, nil
}

// ListInventory fetches all available cosmetics and shop state for a student.
func (s *CharacterService) ListInventory(ctx context.Context, userID uuid.UUID) ([]*model.CharacterItem, error) {
	var level, gold int
	err := s.db.QueryRow(ctx, `SELECT level, gold_balance FROM users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&level, &gold)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	rows, err := s.db.Query(ctx, `
		WITH item_state AS (
			SELECT
				ci.code, ci.name, ci.category, ci.sprite_url, ci.rarity, ci.required_level,
				ci.required_title_code, ci.price_gold, ci.is_shop_item, ci.created_at, ci.sort_order,
				(
					$2 >= ci.required_level
					AND (
						ci.required_title_code IS NULL
						OR EXISTS (
							SELECT 1 FROM user_titles ut
							WHERE ut.user_id = $1 AND ut.title_code = ci.required_title_code
						)
					)
				) AS is_level_unlocked,
				(
					ci.price_gold = 0
					OR EXISTS (
						SELECT 1 FROM user_unlocked_items uui
						WHERE uui.user_id = $1 AND uui.item_code = ci.code
					)
				) AS is_owned
			FROM character_items ci
		)
		SELECT
			code, name, category, sprite_url, rarity, required_level, required_title_code,
			price_gold, is_shop_item, created_at, is_level_unlocked, is_owned,
			(is_owned) AS is_unlocked,
			(is_shop_item AND is_level_unlocked AND NOT is_owned AND $3 >= price_gold) AS can_purchase
		FROM item_state
		ORDER BY
			CASE category
				WHEN 'hair' THEN 1
				WHEN 'hat' THEN 2
				WHEN 'glasses' THEN 3
				WHEN 'top' THEN 4
				WHEN 'bottom' THEN 5
				WHEN 'shoes' THEN 6
				WHEN 'back' THEN 7
				WHEN 'aura' THEN 8
				WHEN 'outfit' THEN 9
				ELSE 10
			END,
			sort_order,
			CASE rarity
				WHEN 'legendary' THEN 4
				WHEN 'epic' THEN 3
				WHEN 'rare' THEN 2
				ELSE 1
			END DESC,
			name`, userID, level, gold)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*model.CharacterItem
	for rows.Next() {
		var item model.CharacterItem
		if err := rows.Scan(
			&item.Code, &item.Name, &item.Category, &item.SpriteURL, &item.Rarity,
			&item.RequiredLevel, &item.RequiredTitleCode, &item.PriceGold, &item.IsShopItem,
			&item.CreatedAt, &item.IsLevelUnlocked, &item.IsOwned, &item.IsUnlocked, &item.CanPurchase,
		); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}

	return items, rows.Err()
}

// EquipItem equips an owned item into its cosmetic slot.
func (s *CharacterService) EquipItem(ctx context.Context, userID uuid.UUID, itemCode string) (*model.UserCharacter, error) {
	var category string
	err := s.db.QueryRow(ctx, `
		SELECT category
		FROM character_items
		WHERE code = $1`, itemCode).Scan(&category)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	if !isEquippableSlot(category) {
		return nil, fmt.Errorf("invalid item category")
	}

	var isOwned bool
	if err := s.db.QueryRow(ctx, `
		SELECT (
			ci.price_gold = 0
			OR EXISTS (
				SELECT 1 FROM user_unlocked_items uui
				WHERE uui.user_id = $1 AND uui.item_code = ci.code
			)
		)
		FROM character_items ci
		WHERE ci.code = $2`, userID, itemCode).Scan(&isOwned); err != nil {
		return nil, err
	}
	if !isOwned {
		return nil, model.ErrForbidden
	}

	if _, err := s.GetCharacter(ctx, userID); err != nil {
		return nil, err
	}

	if err := s.setEquippedItem(ctx, userID, category, itemCode); err != nil {
		return nil, err
	}

	return s.GetCharacter(ctx, userID)
}

func (s *CharacterService) PurchaseItem(ctx context.Context, userID uuid.UUID, itemCode string) (*model.PurchaseItemResponse, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var item model.CharacterItem
	err = tx.QueryRow(ctx, `
		SELECT code, name, category, sprite_url, rarity, required_level, required_title_code,
		       price_gold, is_shop_item, created_at
		FROM character_items
		WHERE code = $1`, itemCode).Scan(
		&item.Code, &item.Name, &item.Category, &item.SpriteURL, &item.Rarity,
		&item.RequiredLevel, &item.RequiredTitleCode, &item.PriceGold, &item.IsShopItem, &item.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}
	if !item.IsShopItem || !isEquippableSlot(item.Category) {
		return nil, model.ErrForbidden
	}

	var level, gold int
	if err := tx.QueryRow(ctx, `
		SELECT level, gold_balance
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
		FOR UPDATE`, userID).Scan(&level, &gold); err != nil {
		return nil, err
	}

	if level < item.RequiredLevel {
		return nil, model.ErrForbidden
	}
	if item.RequiredTitleCode != nil {
		var hasTitle bool
		if err := tx.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1 FROM user_titles
				WHERE user_id = $1 AND title_code = $2
			)`, userID, *item.RequiredTitleCode).Scan(&hasTitle); err != nil {
			return nil, err
		}
		if !hasTitle {
			return nil, model.ErrForbidden
		}
	}

	var isOwned bool
	if err := tx.QueryRow(ctx, `
		SELECT (
			$3::int = 0
			OR EXISTS (
				SELECT 1 FROM user_unlocked_items
				WHERE user_id = $1 AND item_code = $2
			)
		)`, userID, item.Code, item.PriceGold).Scan(&isOwned); err != nil {
		return nil, err
	}
	if isOwned {
		return nil, model.ErrConflict
	}
	if gold < item.PriceGold {
		return nil, model.ErrForbidden
	}

	nextGold := gold
	if item.PriceGold > 0 {
		if err := tx.QueryRow(ctx, `
			UPDATE users
			SET gold_balance = gold_balance - $2, updated_at = now()
			WHERE id = $1 AND deleted_at IS NULL
			RETURNING gold_balance`, userID, item.PriceGold).Scan(&nextGold); err != nil {
			return nil, err
		}

		_, _ = tx.Exec(ctx, `
			INSERT INTO gold_history (user_id, action, gold_amount, balance_after, description, reference_type)
			VALUES ($1, 'shop_purchase', $2, $3, $4, 'character_item')`,
			userID, -item.PriceGold, nextGold, fmt.Sprintf("Purchased %s", item.Name))
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO user_unlocked_items (user_id, item_code)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`, userID, item.Code); err != nil {
		return nil, err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO user_equipped_items (user_id, slot, item_code)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, slot)
		DO UPDATE SET item_code = EXCLUDED.item_code, updated_at = now()`,
		userID, item.Category, item.Code); err != nil {
		return nil, err
	}

	if err := updateLegacyEquippedColumn(ctx, tx, userID, item.Category, item.Code); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	character, err := s.GetCharacter(ctx, userID)
	if err != nil {
		return nil, err
	}

	item.IsOwned = true
	item.IsUnlocked = true
	item.IsLevelUnlocked = true
	item.CanPurchase = false

	return &model.PurchaseItemResponse{
		Character: character,
		Gold:      nextGold,
		Item:      &item,
	}, nil
}

// UnlockItem manually unlocks an item (e.g. earned via special quest completion).
func (s *CharacterService) UnlockItem(ctx context.Context, userID uuid.UUID, itemCode string) error {
	_, err := s.db.Exec(ctx, `
		INSERT INTO user_unlocked_items (user_id, item_code)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`, userID, itemCode)
	return err
}

func (s *CharacterService) setEquippedItem(ctx context.Context, userID uuid.UUID, slot, itemCode string) error {
	_, err := s.db.Exec(ctx, `
		INSERT INTO user_equipped_items (user_id, slot, item_code)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, slot)
		DO UPDATE SET item_code = EXCLUDED.item_code, updated_at = now()`, userID, slot, itemCode)
	if err != nil {
		return err
	}
	return updateLegacyEquippedColumn(ctx, s.db, userID, slot, itemCode)
}

func updateLegacyEquippedColumn(ctx context.Context, executor interface {
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
}, userID uuid.UUID, slot, itemCode string) error {
	var query string
	switch slot {
	case "hair":
		query = `UPDATE user_characters SET equipped_hair = $1, updated_at = now() WHERE user_id = $2`
	case "hat":
		query = `UPDATE user_characters SET equipped_hat = $1, updated_at = now() WHERE user_id = $2`
	case "outfit":
		query = `UPDATE user_characters SET equipped_outfit = $1, updated_at = now() WHERE user_id = $2`
	case "aura":
		query = `UPDATE user_characters SET equipped_aura = $1, updated_at = now() WHERE user_id = $2`
	default:
		return nil
	}
	_, err := executor.Exec(ctx, query, itemCode, userID)
	return err
}

func isEquippableSlot(slot string) bool {
	switch slot {
	case "hair", "hat", "outfit", "glasses", "top", "bottom", "shoes", "back", "aura":
		return true
	default:
		return false
	}
}
