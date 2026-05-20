-- Character shop economy: quest gold, student wallets, purchasable cosmetics,
-- and flexible equipment slots for RPG-style paper-doll customization.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS gold_balance INTEGER NOT NULL DEFAULT 0 CHECK (gold_balance >= 0);

ALTER TABLE learning_quests
    ADD COLUMN IF NOT EXISTS gold_reward INTEGER NOT NULL DEFAULT 0 CHECK (gold_reward >= 0);

ALTER TABLE quest_attempts
    ADD COLUMN IF NOT EXISTS gold_earned INTEGER NOT NULL DEFAULT 0 CHECK (gold_earned >= 0);

ALTER TABLE character_items
    DROP CONSTRAINT IF EXISTS character_items_category_check;

ALTER TABLE character_items
    ADD CONSTRAINT character_items_category_check
    CHECK (category IN ('hair', 'hat', 'outfit', 'glasses', 'top', 'bottom', 'shoes', 'back', 'aura'));

ALTER TABLE character_items
    ADD COLUMN IF NOT EXISTS price_gold INTEGER NOT NULL DEFAULT 0 CHECK (price_gold >= 0),
    ADD COLUMN IF NOT EXISTS is_shop_item BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100;

CREATE TABLE IF NOT EXISTS user_equipped_items (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (slot IN ('hair', 'hat', 'outfit', 'glasses', 'top', 'bottom', 'shoes', 'back', 'aura')),
    item_code TEXT NOT NULL REFERENCES character_items(code) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_user_equipped_items_item
ON user_equipped_items(item_code);

CREATE TABLE IF NOT EXISTS gold_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    gold_amount INTEGER NOT NULL CHECK (gold_amount <> 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gold_history_user_id ON gold_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_history_created_at ON gold_history(created_at);

UPDATE learning_quests
SET gold_reward = CASE difficulty::text
    WHEN 'easy' THEN 8
    WHEN 'medium' THEN 18
    WHEN 'hard' THEN 40
    WHEN 'expert' THEN 75
    ELSE 8
END
WHERE gold_reward = 0;

UPDATE users SET gold_balance = 760 WHERE id = '33333333-3333-3333-3333-333333333333' AND gold_balance = 0;
UPDATE users SET gold_balance = 420 WHERE id = '44444444-4444-4444-4444-444444444444' AND gold_balance = 0;

INSERT INTO character_items (
    code, name, category, sprite_url, rarity, required_level, required_title_code,
    price_gold, is_shop_item, sort_order
)
VALUES
    -- Hair
    ('hair_novice', 'ทรงผมผู้เริ่มต้น', 'hair', 'novice', 'common', 1, NULL, 0, true, 10),
    ('hair_spiky', 'ผมหนามนักผจญภัย', 'hair', 'spiky', 'common', 1, NULL, 80, true, 20),
    ('hair_elegant', 'ผมเปียเจ้าหญิง', 'hair', 'elegant', 'rare', 3, NULL, 220, true, 30),
    ('hair_flaming', 'ผมเพลิงนักสู้', 'hair', 'flaming', 'epic', 8, NULL, 650, true, 40),
    ('hair_silver_wave', 'ผมเงินจันทรา', 'hair', 'silver_wave', 'legendary', 12, 'first_expert_conqueror', 980, true, 50),

    -- Hats
    ('hat_none', 'ไม่สวมหมวก', 'hat', 'none', 'common', 1, NULL, 0, true, 10),
    ('hat_bandana', 'ผ้าคาดหัวสีแดง', 'hat', 'bandana', 'common', 2, NULL, 140, true, 20),
    ('hat_wizard', 'หมวกพ่อมดฝึกหัด', 'hat', 'wizard', 'rare', 5, 'precision_solver', 460, true, 30),
    ('hat_crown', 'มงกุฎทองคำ', 'hat', 'crown', 'epic', 10, NULL, 1050, true, 40),
    ('hat_conqueror', 'หมวกเกราะมังกรดำ', 'hat', 'conqueror', 'legendary', 12, 'first_expert_conqueror', 1800, true, 50),

    -- Glasses
    ('glasses_none', 'ไม่ใส่แว่น', 'glasses', 'none', 'common', 1, NULL, 0, true, 10),
    ('glasses_round', 'แว่นกลมเด็กเรียน', 'glasses', 'round', 'common', 2, NULL, 120, true, 20),
    ('glasses_scholar', 'แว่นนักปราชญ์', 'glasses', 'scholar', 'rare', 4, NULL, 300, true, 30),
    ('glasses_star', 'แว่นดาวประกาย', 'glasses', 'star', 'epic', 8, NULL, 720, true, 40),
    ('glasses_crystal', 'แว่นคริสตัลตำนาน', 'glasses', 'crystal', 'legendary', 12, 'precision_solver', 1400, true, 50),

    -- Tops
    ('top_novice', 'เสื้อฝึกหัด', 'top', 'novice', 'common', 1, NULL, 0, true, 10),
    ('top_cardigan', 'เสื้อคลุมโรงเรียน', 'top', 'cardigan', 'common', 2, NULL, 160, true, 20),
    ('top_sailor', 'เสื้อนักเรียนสายลุย', 'top', 'sailor', 'rare', 4, NULL, 360, true, 30),
    ('top_royal', 'เสื้อราชันย์วิชา', 'top', 'royal', 'epic', 8, NULL, 900, true, 40),
    ('top_aurora', 'เสื้อคลุมออโรร่า', 'top', 'aurora', 'legendary', 12, 'first_expert_conqueror', 1800, true, 50),

    -- Bottoms
    ('bottom_novice', 'กางเกงฝึกหัด', 'bottom', 'novice', 'common', 1, NULL, 0, true, 10),
    ('bottom_school', 'กางเกงนักเรียนเรียบร้อย', 'bottom', 'school', 'common', 2, NULL, 140, true, 20),
    ('bottom_adventurer', 'กางเกงนักสำรวจ', 'bottom', 'adventurer', 'rare', 4, NULL, 330, true, 30),
    ('bottom_royal', 'กางเกงราชันย์วิชา', 'bottom', 'royal', 'epic', 8, NULL, 820, true, 40),

    -- Shoes
    ('shoes_novice', 'รองเท้าฝึกหัด', 'shoes', 'novice', 'common', 1, NULL, 0, true, 10),
    ('shoes_canvas', 'รองเท้าผ้าใบสดใส', 'shoes', 'canvas', 'common', 1, NULL, 100, true, 20),
    ('shoes_wing', 'รองเท้าปีกเบา', 'shoes', 'wing', 'epic', 6, NULL, 520, true, 30),
    ('shoes_moon', 'รองเท้าจันทรา', 'shoes', 'moon', 'legendary', 12, 'hard_streak_5', 1250, true, 40),

    -- Back
    ('back_none', 'ไม่มีของหลัง', 'back', 'none', 'common', 1, NULL, 0, true, 10),
    ('back_satchel', 'กระเป๋านักเรียนผจญภัย', 'back', 'satchel', 'common', 2, NULL, 180, true, 20),
    ('back_cape', 'ผ้าคลุมผู้พิชิตบทเรียน', 'back', 'cape', 'epic', 7, NULL, 680, true, 30),
    ('back_wings', 'ปีกแสงแห่งความพยายาม', 'back', 'wings', 'legendary', 12, 'first_expert_conqueror', 1600, true, 40),

    -- Full outfits kept for backwards compatibility
    ('outfit_novice', 'ชุดผ้าฝึกฝน', 'outfit', 'novice', 'common', 1, NULL, 0, false, 10),
    ('outfit_apprentice', 'ชุดกิโมโนนักเดินทาง', 'outfit', 'apprentice', 'common', 2, NULL, 240, false, 20),
    ('outfit_wizard', 'เสื้อคลุมจอมเวทสะกดจิต', 'outfit', 'wizard', 'rare', 5, 'precision_solver', 520, false, 30),
    ('outfit_plate', 'ชุดเกราะเหล็กกล้า', 'outfit', 'plate', 'epic', 10, NULL, 1000, false, 40),
    ('outfit_god', 'เกราะเทพจุติ', 'outfit', 'god', 'legendary', 12, 'first_expert_conqueror', 2000, false, 50),

    -- Auras
    ('aura_none', 'ไม่มีออร่า', 'aura', 'none', 'common', 1, NULL, 0, true, 10),
    ('aura_glow', 'ออร่าฟ้าจางๆ', 'aura', 'glow', 'rare', 4, NULL, 450, true, 20),
    ('aura_fire', 'ออร่าเพลิงสุริยะ', 'aura', 'fire', 'epic', 8, 'hard_streak_5', 1000, true, 30),
    ('aura_rainbow', 'ออร่าประกายเจ็ดสี', 'aura', 'rainbow', 'legendary', 12, 'first_expert_conqueror', 2200, true, 40)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    sprite_url = EXCLUDED.sprite_url,
    rarity = EXCLUDED.rarity,
    required_level = EXCLUDED.required_level,
    required_title_code = EXCLUDED.required_title_code,
    price_gold = EXCLUDED.price_gold,
    is_shop_item = EXCLUDED.is_shop_item,
    sort_order = EXCLUDED.sort_order;

INSERT INTO user_equipped_items (user_id, slot, item_code)
SELECT u.id, defaults.slot, defaults.item_code
FROM users u
CROSS JOIN (
    VALUES
        ('hair', 'hair_novice'),
        ('hat', 'hat_none'),
        ('glasses', 'glasses_none'),
        ('top', 'top_novice'),
        ('bottom', 'bottom_novice'),
        ('shoes', 'shoes_novice'),
        ('back', 'back_none'),
        ('aura', 'aura_none')
) AS defaults(slot, item_code)
WHERE u.deleted_at IS NULL
ON CONFLICT (user_id, slot) DO NOTHING;
