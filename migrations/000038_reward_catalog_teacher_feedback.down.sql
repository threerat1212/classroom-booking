INSERT INTO reward_items (
    code, name, description, category, reward_type, icon, price_gold,
    required_level, stock_limit, weekly_limit, max_per_user, requires_approval, sort_order
)
VALUES
    ('badge_showcase_slot', 'Badge Forge Pass', 'ส่งคำขอให้ครูเลือก Badge เด่นหรือ Badge พิเศษสำหรับโชว์บนหน้า Achievement', 'recognition', 'badge_forge', 'award', 550, 3, NULL, NULL, 2, true, 120),
    ('certificate', 'Astral Scholar Certificate', 'ใบประกาศดิจิทัลสำหรับผู้พิชิต Season Quest แรกอย่างโดดเด่น', 'recognition', 'certificate', 'file_badge', 1000, 4, 40, NULL, 3, true, 130),
    ('hall_of_fame', 'Weekly Hall of Fame', 'เสนอชื่อขึ้นกระดาน Hall of Fame ประจำสัปดาห์', 'recognition', 'hall_of_fame', 'trophy', 1500, 5, 10, 1, NULL, true, 140),
    ('certificate_quantum_trailblazer', 'Quantum Trailblazer Certificate', 'ใบประกาศสำหรับนักเรียนที่ผ่าน Quest ยากหลายหัวข้อและกล้าลองวิธีคิดใหม่', 'recognition', 'certificate', 'file_badge', 2200, 6, 30, NULL, 2, true, 150),
    ('season_legend_wall', 'Season Legend Wall', 'ขึ้นชื่อบนผนังเกียรติยศปลาย Season สำหรับผู้สร้าง impact ในห้องเรียน', 'recognition', 'legend_wall', 'trophy', 4200, 9, 8, 1, NULL, true, 170),
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
