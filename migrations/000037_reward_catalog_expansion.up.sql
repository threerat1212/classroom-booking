-- Expand Reward Shop into a longer level curve and replace low-impact rewards
-- with benefits that map to visible workflows in Learning Quests and teacher review.

INSERT INTO reward_items (
    code, name, description, category, reward_type, icon, price_gold,
    required_level, stock_limit, weekly_limit, max_per_user, requires_approval, sort_order
)
VALUES
    ('hint_token', 'Hint Token', 'ใช้จากหน้า Learning Quest เพื่อขอ AI Hint 1 ครั้งแบบไม่เฉลยคำตอบ', 'learning_boost', 'hint_token', 'lightbulb', 150, 1, NULL, 5, NULL, false, 10),
    ('retry_pass', 'Retry Pass', 'ขอสิทธิ์ทำ Quest เดิมซ้ำ 1 ครั้ง เมื่อครูอนุมัติ', 'learning_boost', 'retry_pass', 'rotate_ccw', 250, 1, NULL, 2, NULL, true, 20),
    ('feedback_priority', 'Fast Feedback Pass', 'ส่งคำขอเข้าคิว Reward Requests ให้ครูตรวจงานหรือให้ feedback ก่อนคิวปกติ', 'learning_boost', 'feedback_priority', 'message_square', 350, 2, NULL, 1, NULL, true, 30),
    ('socratic_spark', 'Socratic Spark', 'แลกคำถามชี้นำจาก AI เพื่อช่วยคิดต่อเองโดยไม่บอกคำตอบตรง ๆ', 'learning_boost', 'ai_hint', 'lightbulb', 220, 2, NULL, 3, NULL, false, 40),
    ('explain_after_try', 'Explain After Try', 'หลังส่งคำตอบแล้ว ขอคำอธิบายเพิ่มแบบ step-by-step จากครูหรือ AI', 'learning_boost', 'explain_after_try', 'message_square', 450, 3, NULL, 2, NULL, true, 50),
    ('focus_sprint_pack', 'Focus Sprint Pack', 'เปิดรอบฝึก 10 นาทีพร้อมโจทย์สั้นพิเศษสำหรับทบทวนก่อน quiz', 'learning_boost', 'focus_sprint', 'clock', 650, 4, NULL, 1, NULL, true, 60),
    ('deadline_grace', 'Deadline Grace', 'ขอขยายเวลาส่งงานได้ 1 วันสำหรับงานที่ครูกำหนด', 'learning_boost', 'deadline_grace', 'clock', 800, 5, NULL, 1, NULL, true, 70),
    ('mistake_map_review', 'Mistake Map Review', 'ให้ครูช่วยสรุป pattern จุดที่พลาดจาก Quest ล่าสุดเป็นแผนแก้จุดอ่อน', 'learning_boost', 'mistake_map', 'list_checks', 1200, 6, NULL, 1, NULL, true, 80),
    ('mastery_retry_pass', 'Mastery Retry Pass', 'ปลดล็อกโอกาสแก้ตัว Quest ระดับ Hard/Expert 1 ครั้งแบบมี feedback ก่อนเริ่มใหม่', 'learning_boost', 'mastery_retry', 'rotate_ccw', 1800, 8, NULL, 1, NULL, true, 90),
    ('boss_practice_pack', 'Boss Practice Pack', 'ขอชุดฝึกก่อน Final Boss Quest จากหัวข้อที่ตัวเองอ่อนที่สุด', 'learning_boost', 'boss_pack', 'flag', 2600, 10, NULL, 1, NULL, true, 100),

    ('title_quest_hunter', 'Quest Hunter Title', 'ปลดล็อกฉายา Quest Hunter สำหรับโชว์บนโปรไฟล์และตารางคะแนน', 'recognition', 'profile_title', 'medal', 400, 2, NULL, NULL, 1, false, 110),
    ('badge_showcase_slot', 'Badge Forge Pass', 'ส่งคำขอให้ครูเลือก Badge เด่นหรือ Badge พิเศษสำหรับโชว์บนหน้า Achievement', 'recognition', 'badge_forge', 'award', 550, 3, NULL, NULL, 2, true, 120),
    ('certificate', 'Astral Scholar Certificate', 'ใบประกาศดิจิทัลสำหรับผู้พิชิต Season Quest แรกอย่างโดดเด่น', 'recognition', 'certificate', 'file_badge', 1000, 4, 40, NULL, 3, true, 130),
    ('hall_of_fame', 'Weekly Hall of Fame', 'เสนอชื่อขึ้นกระดาน Hall of Fame ประจำสัปดาห์', 'recognition', 'hall_of_fame', 'trophy', 1500, 5, 10, 1, NULL, true, 140),
    ('certificate_quantum_trailblazer', 'Quantum Trailblazer Certificate', 'ใบประกาศสำหรับนักเรียนที่ผ่าน Quest ยากหลายหัวข้อและกล้าลองวิธีคิดใหม่', 'recognition', 'certificate', 'file_badge', 2200, 6, 30, NULL, 2, true, 150),
    ('spotlight_profile', 'Spotlight Profile', 'ให้โปรไฟล์ของนักเรียนขึ้นแนะนำในหน้า leaderboard/ชั้นเรียนรอบถัดไป', 'recognition', 'spotlight', 'sparkles', 2800, 7, 10, 1, NULL, true, 160),
    ('season_legend_wall', 'Season Legend Wall', 'ขึ้นชื่อบนผนังเกียรติยศปลาย Season สำหรับผู้สร้าง impact ในห้องเรียน', 'recognition', 'legend_wall', 'trophy', 4200, 9, 8, 1, NULL, true, 170),
    ('certificate_legendary_questmaster', 'Legendary Questmaster Certificate', 'ใบประกาศระดับสูงสำหรับผู้ผ่าน Quest ต่อเนื่องและช่วยยกระดับทีม', 'recognition', 'certificate', 'file_badge', 6000, 12, 12, NULL, 1, true, 180),

    ('team_name_right', 'Team Banner Takeover', 'ตั้งชื่อทีม เลือกสี/สัญลักษณ์ และคำขวัญสำหรับกิจกรรมกลุ่มรอบถัดไป', 'privilege', 'team_banner', 'users', 300, 1, NULL, 1, NULL, true, 190),
    ('quiz_topic_pick', 'Pick Mini Quiz Topic', 'เลือกหัวข้อ mini quiz หรือโจทย์ทบทวนรอบถัดไป', 'privilege', 'quiz_topic', 'list_checks', 500, 2, NULL, 1, NULL, true, 200),
    ('quest_captain', 'Quest Captain', 'รับบทหัวหน้าทีมช่วยจัด strategy ใน Quest กลุ่ม', 'privilege', 'quest_captain', 'flag', 900, 4, 8, 1, NULL, true, 210),
    ('choose_bonus_challenge', 'Bonus Challenge Architect', 'เสนอรูปแบบ Bonus Challenge ให้ครูเลือกใช้ในรอบถัดไป', 'privilege', 'bonus_challenge', 'sparkles', 1400, 5, NULL, 1, NULL, true, 220),
    ('peer_duel_invite', 'Peer Duel Invite', 'ชวนเพื่อนแข่ง Quest แบบ 1v1 เพื่อชิง XP/Gold โบนัสที่ครูกำหนด', 'privilege', 'peer_duel', 'trophy', 2200, 6, NULL, 1, NULL, true, 230),
    ('leaderboard_shield', 'Leaderboard Shield', 'ขอปักหมุดผลงานดีที่สุดของสัปดาห์ไว้ใน leaderboard แม้มีคะแนนใหม่เข้ามา', 'privilege', 'leaderboard_shield', 'shield_check', 3000, 8, 12, 1, NULL, true, 240),
    ('final_boss_nomination', 'Final Boss Nomination', 'เสนอชื่อหัวข้อ Final Boss Quest ปลาย Season ให้ทั้งห้องโหวต', 'privilege', 'final_boss', 'flag', 5200, 11, 6, 1, NULL, true, 250)
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
