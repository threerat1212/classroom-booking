CREATE TYPE learning_material_type AS ENUM ('text', 'file', 'youtube', 'link', 'ai_summary');

CREATE TABLE learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    material_type learning_material_type NOT NULL DEFAULT 'text',
    content TEXT,
    url TEXT,
    file_urls TEXT[] NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_learning_materials_classroom_id
ON learning_materials(classroom_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_learning_materials_teacher_id
ON learning_materials(teacher_id)
WHERE deleted_at IS NULL;

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS grade_code TEXT CHECK (grade_code IS NULL OR grade_code IN ('ร', '0', '1', '1.5', '2', '2.5', '3', '3.5', '4'));

ALTER TABLE grades
ADD COLUMN IF NOT EXISTS grade_code TEXT CHECK (grade_code IS NULL OR grade_code IN ('ร', '0', '1', '1.5', '2', '2.5', '3', '3.5', '4'));

UPDATE users
SET level = GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int),
    rank_title = CASE
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 50 THEN 'Legend'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 40 THEN 'Grandmaster'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 30 THEN 'Master'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 20 THEN 'Expert'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 15 THEN 'Scholar'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 10 THEN 'Veteran'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 7 THEN 'Skilled'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 5 THEN 'Adept'
        WHEN GREATEST(1, floor((1 + sqrt(1 + (xp * 0.08))) / 2)::int) >= 3 THEN 'Apprentice'
        ELSE 'Novice'
    END,
    updated_at = now()
WHERE role = 'student';
