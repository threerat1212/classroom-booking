package service

import (
	"context"
	"errors"
	"fmt"

	"classroom-api/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CharacterService struct {
	db *pgxpool.Pool
}

func NewCharacterService(db *pgxpool.Pool) *CharacterService {
	return &CharacterService{db: db}
}

// GetCharacter fetches or initializes a student's character customization
func (s *CharacterService) GetCharacter(ctx context.Context, userID uuid.UUID) (*model.UserCharacter, error) {
	var c model.UserCharacter
	err := s.db.QueryRow(ctx, `
		SELECT user_id, equipped_hair, equipped_hat, equipped_outfit, equipped_aura, updated_at
		FROM user_characters
		WHERE user_id = $1`, userID).Scan(&c.UserID, &c.EquippedHair, &c.EquippedHat, &c.EquippedOutfit, &c.EquippedAura, &c.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Initialize default character
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
			return &c, nil
		}
		return nil, err
	}

	return &c, nil
}

// ListInventory fetches all available character cosmetics, indicating unlocked status
func (s *CharacterService) ListInventory(ctx context.Context, userID uuid.UUID) ([]*model.CharacterItem, error) {
	// Fetch user level first
	var level int
	err := s.db.QueryRow(ctx, `SELECT level FROM users WHERE id = $1`, userID).Scan(&level)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	rows, err := s.db.Query(ctx, `
		SELECT
			ci.code, ci.name, ci.category, ci.sprite_url, ci.rarity, ci.required_level, ci.required_title_code, ci.created_at,
			(
				EXISTS (SELECT 1 FROM user_unlocked_items uui WHERE uui.user_id = $1 AND uui.item_code = ci.code)
				OR
				(
					$2 >= ci.required_level
					AND (
						ci.required_title_code IS NULL
						OR EXISTS (SELECT 1 FROM user_titles ut WHERE ut.user_id = $1 AND ut.title_code = ci.required_title_code)
					)
				)
			) AS is_unlocked
		FROM character_items ci
		ORDER BY
			CASE ci.category
				WHEN 'aura' THEN 1
				WHEN 'outfit' THEN 2
				WHEN 'hair' THEN 3
				WHEN 'hat' THEN 4
			END,
			CASE ci.rarity
				WHEN 'legendary' THEN 4
				WHEN 'epic' THEN 3
				WHEN 'rare' THEN 2
				ELSE 1
			END DESC,
			ci.name`, userID, level)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*model.CharacterItem
	for rows.Next() {
		var item model.CharacterItem
		if err := rows.Scan(
			&item.Code, &item.Name, &item.Category, &item.SpriteURL, &item.Rarity,
			&item.RequiredLevel, &item.RequiredTitleCode, &item.CreatedAt, &item.IsUnlocked,
		); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}

	return items, rows.Err()
}

// EquipItem equips an item, checking first if it is unlocked for the user
func (s *CharacterService) EquipItem(ctx context.Context, userID uuid.UUID, itemCode string) (*model.UserCharacter, error) {
	// 1. Get user level
	var level int
	err := s.db.QueryRow(ctx, `SELECT level FROM users WHERE id = $1`, userID).Scan(&level)
	if err != nil {
		return nil, model.ErrNotFound
	}

	// 2. Fetch the item details and check unlock status
	var (
		category          string
		requiredLevel     int
		requiredTitleCode *string
	)
	err = s.db.QueryRow(ctx, `
		SELECT category, required_level, required_title_code
		FROM character_items
		WHERE code = $1`, itemCode).Scan(&category, &requiredLevel, &requiredTitleCode)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("item not found")
		}
		return nil, err
	}

	// 3. Verify unlock status
	var isUnlocked bool
	err = s.db.QueryRow(ctx, `
		SELECT (
			EXISTS (SELECT 1 FROM user_unlocked_items uui WHERE uui.user_id = $1 AND uui.item_code = $2)
			OR (
				$3::int >= $4::int
				AND (
					$5::text IS NULL
					OR EXISTS (SELECT 1 FROM user_titles ut WHERE ut.user_id = $1 AND ut.title_code = $5)
				)
			)
		)`, userID, itemCode, level, requiredLevel, requiredTitleCode).Scan(&isUnlocked)
	if err != nil {
		return nil, err
	}

	if !isUnlocked {
		return nil, model.ErrForbidden // locked item
	}

	// Ensure user character is initialized
	_, err = s.GetCharacter(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 4. Update the corresponding equipped column
	var query string
	switch category {
	case "hair":
		query = `UPDATE user_characters SET equipped_hair = $1, updated_at = now() WHERE user_id = $2`
	case "hat":
		query = `UPDATE user_characters SET equipped_hat = $1, updated_at = now() WHERE user_id = $2`
	case "outfit":
		query = `UPDATE user_characters SET equipped_outfit = $1, updated_at = now() WHERE user_id = $2`
	case "aura":
		query = `UPDATE user_characters SET equipped_aura = $1, updated_at = now() WHERE user_id = $2`
	default:
		return nil, fmt.Errorf("invalid item category")
	}

	_, err = s.db.Exec(ctx, query, itemCode, userID)
	if err != nil {
		return nil, err
	}

	return s.GetCharacter(ctx, userID)
}

// UnlockItem manually unlocks an item (e.g. earned via special quest completion or direct purchase)
func (s *CharacterService) UnlockItem(ctx context.Context, userID uuid.UUID, itemCode string) error {
	_, err := s.db.Exec(ctx, `
		INSERT INTO user_unlocked_items (user_id, item_code)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING`, userID, itemCode)
	return err
}
