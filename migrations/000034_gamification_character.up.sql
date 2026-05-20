CREATE TABLE IF NOT EXISTS character_items (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'hat', 'outfit', 'aura')),
    sprite_url TEXT NOT NULL DEFAULT '', -- can store SVG path, icon name, or color config
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    required_level INT NOT NULL DEFAULT 1,
    required_title_code TEXT REFERENCES learning_titles(code) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_unlocked_items (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL REFERENCES character_items(code) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, item_code)
);

CREATE TABLE IF NOT EXISTS user_characters (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    equipped_hair TEXT REFERENCES character_items(code) ON DELETE SET NULL,
    equipped_hat TEXT REFERENCES character_items(code) ON DELETE SET NULL,
    equipped_outfit TEXT REFERENCES character_items(code) ON DELETE SET NULL,
    equipped_aura TEXT REFERENCES character_items(code) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed character items
INSERT INTO character_items (code, name, category, sprite_url, rarity, required_level, required_title_code)
VALUES
    -- Hair
    ('hair_novice', 'ทรงผมผู้เริ่มต้น', 'hair', 'novice', 'common', 1, NULL),
    ('hair_spiky', 'ผมหนามผู้กล้า', 'hair', 'spiky', 'common', 1, NULL),
    ('hair_elegant', 'ผมเปียเจ้าหญิง', 'hair', 'elegant', 'rare', 3, NULL),
    ('hair_flaming', 'ผมเพลิงนักรบ', 'hair', 'flaming', 'epic', 8, NULL),

    -- Hats
    ('hat_none', 'ไม่สวมหมวก', 'hat', 'none', 'common', 1, NULL),
    ('hat_bandana', 'ผ้าคาดหัวสีแดง', 'hat', 'bandana', 'common', 2, NULL),
    ('hat_wizard', 'หมวกพ่อมดฝึกหัด', 'hat', 'wizard', 'rare', 5, 'precision_solver'),
    ('hat_crown', 'มงกุฎทองคำทองคำ', 'hat', 'crown', 'epic', 10, NULL),
    ('hat_conqueror', 'หมวกเกราะมังกรดำ', 'hat', 'conqueror', 'legendary', 12, 'first_expert_conqueror'),

    -- Outfits
    ('outfit_novice', 'ชุดผ้าฝึกฝน', 'outfit', 'novice', 'common', 1, NULL),
    ('outfit_apprentice', 'ชุดกิโมโนนักเดินทาง', 'outfit', 'apprentice', 'common', 2, NULL),
    ('outfit_wizard', 'เสื้อคลุมจอมเวทสะกดจิต', 'outfit', 'wizard', 'rare', 5, 'precision_solver'),
    ('outfit_plate', 'ชุดเกราะเหล็กกล้า', 'outfit', 'plate', 'epic', 10, NULL),
    ('outfit_god', 'เกราะเทพจุติ', 'outfit', 'god', 'legendary', 12, 'first_expert_conqueror'),

    -- Auras
    ('aura_none', 'ไม่มีออร่า', 'aura', 'none', 'common', 1, NULL),
    ('aura_glow', 'ออร่าฟ้าจางๆ', 'aura', 'glow', 'rare', 4, NULL),
    ('aura_fire', 'ออร่าเพลิงสุริยะ', 'aura', 'fire', 'epic', 8, 'hard_streak_5'),
    ('aura_rainbow', 'ออร่าประกายเจ็ดสี', 'aura', 'rainbow', 'legendary', 12, 'first_expert_conqueror')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    sprite_url = EXCLUDED.sprite_url,
    rarity = EXCLUDED.rarity,
    required_level = EXCLUDED.required_level,
    required_title_code = EXCLUDED.required_title_code;
