-- Refine recognition rewards after teacher feedback so each item has a clear
-- classroom effect and avoids term-long "season" wording.

INSERT INTO reward_items (
    code, name, description, category, reward_type, icon, price_gold,
    required_level, stock_limit, weekly_limit, max_per_user, requires_approval, sort_order
)
VALUES
    ('badge_showcase_slot', 'Achievement Spotlight Pass', 'เลือก Achievement ที่ปลดล็อกแล้ว 1 อันเพื่อส่งเข้าคิว Spotlight ให้ครูดันขึ้นหน้า Achievement หรือ Leaderboard รอบถัดไป', 'recognition', 'achievement_spotlight', 'award', 550, 3, NULL, NULL, 2, true, 120),
    ('certificate', 'Astral Scholar Certificate', 'ใบประกาศดิจิทัลสำหรับจบ Quest Arc 1 ชุดด้วยผลงานเด่น โดย Quest Arc คือรอบเรียนสั้นประมาณ 2-4 สัปดาห์หรือ 1 หน่วยการเรียน ไม่ใช่ทั้งเทอม', 'recognition', 'certificate', 'file_badge', 1000, 4, 40, NULL, 3, true, 130),
    ('hall_of_fame', 'Grade Weekly Hall of Fame', 'เสนอชื่อเข้ารอบ Hall of Fame ระดับสายชั้น เช่น ม.4 รวมทุกห้อง ประจำสัปดาห์ แข่งจาก XP, Quest completion, streak และผลงานที่ครูอนุมัติ', 'recognition', 'grade_hall_of_fame', 'trophy', 1500, 5, 10, 1, NULL, true, 140),
    ('certificate_quantum_trailblazer', 'Quantum Trailblazer Achievement', 'Achievement สำหรับนักเรียนที่ผ่าน Quest ยากหลายหัวข้อและกล้าลองวิธีคิดใหม่ แสดงบนหน้า Achievement และใช้ประกอบ Hall of Fame ได้', 'recognition', 'achievement', 'award', 2200, 6, 30, NULL, 2, true, 150),
    ('season_legend_wall', 'Quest Arc Legend Wall', 'ขึ้นชื่อบนผนังเกียรติยศปลาย Quest Arc สำหรับผู้สร้าง impact ต่อเพื่อนหรือสายชั้นในรอบ 2-4 สัปดาห์', 'recognition', 'legend_wall', 'trophy', 4200, 9, 8, 1, NULL, true, 170),
    ('final_boss_nomination', 'Final Boss Nomination', 'เสนอชื่อหัวข้อ Final Boss Quest ปลาย Quest Arc ให้ทั้งห้องโหวต', 'privilege', 'final_boss', 'flag', 5200, 11, 6, 1, NULL, true, 250)
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
