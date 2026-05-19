DROP TABLE IF EXISTS classroom_members;
DROP INDEX IF EXISTS idx_rooms_teacher_id;
DROP INDEX IF EXISTS idx_rooms_join_code;
ALTER TABLE rooms DROP COLUMN IF EXISTS join_code;
ALTER TABLE rooms DROP COLUMN IF EXISTS teacher_id;
