DROP INDEX IF EXISTS idx_classroom_members_one_primary;
DROP INDEX IF EXISTS idx_rooms_classroom_grade;
DROP INDEX IF EXISTS idx_users_grade_level;

ALTER TABLE classroom_members
DROP COLUMN IF EXISTS is_primary;

ALTER TABLE rooms
DROP CONSTRAINT IF EXISTS rooms_grade_level_check,
DROP COLUMN IF EXISTS class_section,
DROP COLUMN IF EXISTS grade_level;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_grade_level_check,
DROP COLUMN IF EXISTS grade_level;
