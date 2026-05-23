ALTER TABLE users
ADD COLUMN IF NOT EXISTS grade_level TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_grade_level_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_grade_level_check
    CHECK (grade_level IS NULL OR grade_level IN ('M3', 'M4'))
    NOT VALID;
  END IF;
END $$;

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS class_section TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rooms_grade_level_check'
  ) THEN
    ALTER TABLE rooms
    ADD CONSTRAINT rooms_grade_level_check
    CHECK (grade_level IS NULL OR grade_level IN ('M3', 'M4'))
    NOT VALID;
  END IF;
END $$;

ALTER TABLE classroom_members
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_grade_level
ON users (grade_level)
WHERE deleted_at IS NULL AND role = 'student';

CREATE INDEX IF NOT EXISTS idx_rooms_classroom_grade
ON rooms (grade_level, class_section)
WHERE deleted_at IS NULL AND room_type = 'classroom';

CREATE UNIQUE INDEX IF NOT EXISTS idx_classroom_members_one_primary
ON classroom_members (student_id)
WHERE is_primary = true;

UPDATE users
SET grade_level = 'M3'
WHERE role = 'student'
  AND grade_level IS NULL;

UPDATE rooms
SET
  grade_level = CASE
    WHEN code ~* '^(M|ม\\.)?4' OR name ~* 'ม\\.?4|M4' THEN 'M4'
    ELSE 'M3'
  END,
  class_section = COALESCE(
    NULLIF(substring(code from '/([0-9]+)$'), ''),
    NULLIF(substring(name from '/([0-9]+)$'), ''),
    NULLIF(regexp_replace(code, '\\D', '', 'g'), ''),
    '1'
  )
WHERE room_type = 'classroom'
  AND deleted_at IS NULL
  AND grade_level IS NULL;

WITH ranked_members AS (
  SELECT
    cm.room_id,
    cm.student_id,
    row_number() OVER (PARTITION BY cm.student_id ORDER BY cm.joined_at ASC, cm.room_id ASC) AS rn
  FROM classroom_members cm
)
UPDATE classroom_members cm
SET is_primary = true
FROM ranked_members rm
WHERE cm.room_id = rm.room_id
  AND cm.student_id = rm.student_id
  AND rm.rn = 1
  AND NOT EXISTS (
    SELECT 1
    FROM classroom_members existing
    WHERE existing.student_id = cm.student_id
      AND existing.is_primary = true
  );
