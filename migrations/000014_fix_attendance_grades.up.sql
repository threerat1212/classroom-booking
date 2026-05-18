-- Fix attendance_sessions missing columns and grades missing unique constraint

ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS qr_code TEXT;

ALTER TABLE grades ADD CONSTRAINT grades_student_item_unique UNIQUE (student_id, item_type, item_id);
