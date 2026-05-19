CREATE TABLE IF NOT EXISTS learning_titles (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_unique BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_achievements (
    code TEXT PRIMARY KEY,
    title_code TEXT REFERENCES learning_titles(code),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    trigger_type TEXT NOT NULL DEFAULT 'manual',
    rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unique_title_claims (
    title_code TEXT PRIMARY KEY REFERENCES learning_titles(code) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_titles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_code TEXT NOT NULL REFERENCES learning_titles(code) ON DELETE CASCADE,
    awarded_from_achievement_code TEXT REFERENCES learning_achievements(code),
    is_equipped BOOLEAN NOT NULL DEFAULT false,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, title_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_titles_one_equipped
ON user_titles(user_id)
WHERE is_equipped = true;

CREATE INDEX IF NOT EXISTS idx_user_titles_title_code
ON user_titles(title_code);

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_code TEXT NOT NULL REFERENCES learning_achievements(code) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_code
ON user_achievements(achievement_code);

ALTER TABLE learning_quests
ADD COLUMN IF NOT EXISTS quest_kind TEXT NOT NULL DEFAULT 'standard' CHECK (quest_kind IN ('standard', 'special')),
ADD COLUMN IF NOT EXISTS required_title_code TEXT REFERENCES learning_titles(code),
ADD COLUMN IF NOT EXISTS unlock_note TEXT;

CREATE INDEX IF NOT EXISTS idx_learning_quests_required_title
ON learning_quests(required_title_code)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_learning_quests_kind
ON learning_quests(quest_kind)
WHERE deleted_at IS NULL;

INSERT INTO learning_titles (code, name, description, rarity, is_unique)
VALUES
    ('first_step', 'นักผจญภัยฝึกหัด', 'ทำ Learning Quest ถูกครั้งแรก', 'common', false),
    ('precision_solver', 'มือแม่น 100%', 'ทำ quest ได้คะแนนเต็ม 100', 'common', false),
    ('hard_streak_5', 'สายลุย 5 วัน', 'ทำ quest ระดับ Hard หรือ Expert ถูกต่อเนื่อง 5 วัน', 'rare', false),
    ('first_expert_conqueror', 'ผู้พิชิต Expert คนแรก', 'นักเรียนคนแรกที่เคลียร์ quest ระดับ Expert ได้ถูกต้อง', 'legendary', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    rarity = EXCLUDED.rarity,
    is_unique = EXCLUDED.is_unique;

INSERT INTO learning_achievements (code, title_code, name, description, rarity, trigger_type, rule_config, is_active)
VALUES
    ('first_quest_clear', 'first_step', 'First Quest Clear', 'ตอบ Learning Quest ถูกเป็นครั้งแรก', 'common', 'quest_correct', '{"min_score":1}'::jsonb, true),
    ('perfect_quest', 'precision_solver', 'Perfect Quest', 'ทำ Learning Quest ได้คะแนนเต็ม 100', 'common', 'quest_correct', '{"min_score":100}'::jsonb, true),
    ('hard_streak_5_days', 'hard_streak_5', 'Hard Streak 5 Days', 'ทำ quest ระดับ Hard หรือ Expert ถูกต่อเนื่อง 5 วัน', 'rare', 'hard_quest_streak', '{"days":5,"difficulties":["hard","expert"]}'::jsonb, true),
    ('first_expert_clear_unique', 'first_expert_conqueror', 'First Expert Clear', 'เป็นคนแรกที่เคลียร์ quest ระดับ Expert ได้ถูกต้อง', 'legendary', 'first_expert_correct', '{"difficulty":"expert"}'::jsonb, true)
ON CONFLICT (code) DO UPDATE SET
    title_code = EXCLUDED.title_code,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    rarity = EXCLUDED.rarity,
    trigger_type = EXCLUDED.trigger_type,
    rule_config = EXCLUDED.rule_config,
    is_active = EXCLUDED.is_active;

INSERT INTO learning_quests (
    teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints,
    explanation, exp_reward, time_limit_minutes, status, quest_kind, required_title_code, unlock_note
)
SELECT
    u.id,
    NULL,
    'เควสลับ: ประตูนักผจญภัย',
    'Learning Quest - Special',
    'Special quest unlocked by the first quest title.',
    'easy',
    'อธิบายสั้น ๆ ว่า EXP และ Level ช่วยให้เราฝึกทบทวนบทเรียนอย่างต่อเนื่องได้อย่างไร',
    'EXP และ Level ช่วยให้เห็นความก้าวหน้าและกระตุ้นให้ฝึกต่อเนื่อง',
    ARRAY['คิดถึงสิ่งที่เกิดขึ้นหลังทำ quest สำเร็จ', 'คำตอบควรพูดถึงความก้าวหน้าและการฝึกซ้ำ'],
    'คำตอบที่ดีควรเชื่อม EXP/Level กับการเห็นพัฒนาการของตนเองและการฝึกอย่างสม่ำเสมอ',
    20,
    8,
    'active',
    'special',
    'first_step',
    'ปลดล็อกด้วยฉายา นักผจญภัยฝึกหัด'
FROM users u
WHERE u.deleted_at IS NULL AND u.role IN ('teacher', 'admin')
ORDER BY u.created_at
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO learning_quests (
    teacher_id, classroom_id, title, topic, description, difficulty, question, answer, hints,
    explanation, exp_reward, time_limit_minutes, status, quest_kind, required_title_code, unlock_note
)
SELECT
    u.id,
    NULL,
    'เควสลับ: ห้องทดสอบความแม่นยำ',
    'Learning Quest - Special',
    'Special quest unlocked by the perfect-score title.',
    'medium',
    'ถ้านักเรียนทำแบบฝึก 5 ข้อถูกทั้งหมด คิดเป็นกี่เปอร์เซ็นต์',
    '100%',
    ARRAY['เปอร์เซ็นต์ = ข้อที่ถูก / จำนวนข้อทั้งหมด x 100', '5 จาก 5 คือครบทั้งหมด'],
    '5/5 x 100 = 100% จึงเป็นคะแนนเต็ม',
    35,
    10,
    'active',
    'special',
    'precision_solver',
    'ปลดล็อกด้วยฉายา มือแม่น 100%'
FROM users u
WHERE u.deleted_at IS NULL AND u.role IN ('teacher', 'admin')
ORDER BY u.created_at
LIMIT 1
ON CONFLICT DO NOTHING;
