-- Quest-based reward shop replacing the retired character cosmetics system.
-- Keep gold_balance and gold_history from the quest economy; remove the
-- character-facing tables so rewards become the only gold sink.

CREATE TABLE IF NOT EXISTS reward_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('learning_boost', 'recognition', 'privilege')),
    reward_type TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'gift',
    price_gold INTEGER NOT NULL CHECK (price_gold >= 0),
    required_level INTEGER NOT NULL DEFAULT 1 CHECK (required_level >= 1),
    stock_limit INTEGER CHECK (stock_limit IS NULL OR stock_limit > 0),
    weekly_limit INTEGER CHECK (weekly_limit IS NULL OR weekly_limit > 0),
    max_per_user INTEGER CHECK (max_per_user IS NULL OR max_per_user > 0),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reward_items_category ON reward_items(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reward_items_active ON reward_items(is_active) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES reward_items(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gold_spent INTEGER NOT NULL CHECK (gold_spent >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled', 'used')),
    note TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_requested_at ON reward_redemptions(requested_at);

INSERT INTO reward_items (
    code, name, description, category, reward_type, icon, price_gold,
    required_level, stock_limit, weekly_limit, max_per_user, requires_approval, sort_order
)
VALUES
    ('hint_token', 'Hint Token', 'ใช้ขอคำใบ้เพิ่มใน Quest ได้ 1 ครั้ง', 'learning_boost', 'hint_token', 'lightbulb', 150, 1, NULL, 3, NULL, false, 10),
    ('retry_pass', 'Retry Pass', 'ขอสิทธิ์ทำ Quest เดิมซ้ำได้ 1 ครั้งเมื่อครูอนุมัติ', 'learning_boost', 'retry_pass', 'rotate_ccw', 250, 1, NULL, 2, NULL, true, 20),
    ('feedback_priority', 'Feedback Priority', 'ส่งคำตอบให้ครูตรวจหรือให้ feedback ก่อนคิวปกติ', 'learning_boost', 'feedback_priority', 'message_square', 350, 2, NULL, 1, NULL, true, 30),
    ('deadline_grace', 'Deadline Grace', 'ขอขยายเวลาส่งงานได้ 1 วันสำหรับงานที่ครูกำหนด', 'learning_boost', 'deadline_grace', 'clock', 600, 3, NULL, 1, NULL, true, 40),
    ('title_quest_hunter', 'Quest Hunter Title', 'ปลดล็อกฉายา Quest Hunter สำหรับโชว์บนโปรไฟล์และตารางคะแนน', 'recognition', 'profile_title', 'medal', 400, 2, NULL, NULL, 1, false, 50),
    ('badge_showcase_slot', 'Badge Showcase Slot', 'เพิ่มช่องโชว์ Badge เด่นบนหน้าโปรไฟล์ของนักเรียน', 'recognition', 'badge_slot', 'award', 550, 3, NULL, NULL, 2, false, 60),
    ('certificate', 'Digital Certificate', 'แลกใบประกาศความสำเร็จประจำ Season หรือหัวข้อ Quest', 'recognition', 'certificate', 'file_badge', 1000, 4, 30, NULL, 3, true, 70),
    ('hall_of_fame', 'Weekly Hall of Fame', 'เสนอชื่อขึ้นกระดาน Hall of Fame ประจำสัปดาห์', 'recognition', 'hall_of_fame', 'trophy', 1500, 5, 10, 1, NULL, true, 80),
    ('quiz_topic_pick', 'Pick Mini Quiz Topic', 'เลือกหัวข้อ mini quiz หรือโจทย์ทบทวนรอบถัดไป', 'privilege', 'quiz_topic', 'list_checks', 500, 2, NULL, 1, NULL, true, 90),
    ('team_name_right', 'Team Naming Right', 'ได้สิทธิ์ตั้งชื่อทีม/กลุ่มในกิจกรรมครั้งถัดไป', 'privilege', 'team_name', 'users', 300, 1, NULL, 1, NULL, true, 100),
    ('quest_captain', 'Quest Captain', 'รับบทหัวหน้าทีมช่วยจัด strategy ใน Quest กลุ่ม', 'privilege', 'quest_captain', 'flag', 900, 4, 8, 1, NULL, true, 110)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    reward_type = EXCLUDED.reward_type,
    icon = EXCLUDED.icon,
    price_gold = EXCLUDED.price_gold,
    required_level = EXCLUDED.required_level,
    stock_limit = EXCLUDED.stock_limit,
    weekly_limit = EXCLUDED.weekly_limit,
    max_per_user = EXCLUDED.max_per_user,
    requires_approval = EXCLUDED.requires_approval,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    deleted_at = NULL,
    updated_at = now();

DROP TABLE IF EXISTS user_equipped_items CASCADE;
DROP TABLE IF EXISTS user_characters CASCADE;
DROP TABLE IF EXISTS user_unlocked_items CASCADE;
DROP TABLE IF EXISTS character_items CASCADE;
