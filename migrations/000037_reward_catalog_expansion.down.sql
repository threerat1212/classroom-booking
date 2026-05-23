DELETE FROM reward_items
WHERE code IN (
    'socratic_spark',
    'explain_after_try',
    'focus_sprint_pack',
    'mistake_map_review',
    'mastery_retry_pass',
    'boss_practice_pack',
    'certificate_quantum_trailblazer',
    'spotlight_profile',
    'season_legend_wall',
    'certificate_legendary_questmaster',
    'choose_bonus_challenge',
    'peer_duel_invite',
    'leaderboard_shield',
    'final_boss_nomination'
);

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
