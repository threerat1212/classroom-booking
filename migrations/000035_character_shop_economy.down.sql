DELETE FROM user_equipped_items
WHERE slot IN ('glasses', 'top', 'bottom', 'shoes', 'back');

DROP TABLE IF EXISTS gold_history;
DROP TABLE IF EXISTS user_equipped_items;

DELETE FROM character_items
WHERE category IN ('glasses', 'top', 'bottom', 'shoes', 'back')
   OR code IN (
        'hair_silver_wave',
        'glasses_none', 'glasses_round', 'glasses_scholar', 'glasses_star', 'glasses_crystal',
        'top_novice', 'top_cardigan', 'top_sailor', 'top_royal', 'top_aurora',
        'bottom_novice', 'bottom_school', 'bottom_adventurer', 'bottom_royal',
        'shoes_novice', 'shoes_canvas', 'shoes_wing', 'shoes_moon',
        'back_none', 'back_satchel', 'back_cape', 'back_wings'
   );

ALTER TABLE character_items
    DROP CONSTRAINT IF EXISTS character_items_category_check;

ALTER TABLE character_items
    ADD CONSTRAINT character_items_category_check
    CHECK (category IN ('hair', 'hat', 'outfit', 'aura'));

ALTER TABLE character_items
    DROP COLUMN IF EXISTS price_gold,
    DROP COLUMN IF EXISTS is_shop_item,
    DROP COLUMN IF EXISTS sort_order;

ALTER TABLE quest_attempts
    DROP COLUMN IF EXISTS gold_earned;

ALTER TABLE learning_quests
    DROP COLUMN IF EXISTS gold_reward;

ALTER TABLE users
    DROP COLUMN IF EXISTS gold_balance;
