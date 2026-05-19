ALTER TABLE rooms ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS join_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_join_code
ON rooms (lower(join_code))
WHERE deleted_at IS NULL AND join_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rooms_teacher_id
ON rooms (teacher_id)
WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS classroom_members (
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (room_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id
ON classroom_members (student_id);

UPDATE rooms
SET teacher_id = '22222222-2222-2222-2222-222222222222'
WHERE room_type = 'classroom'
  AND teacher_id IS NULL;

UPDATE rooms
SET join_code = upper(code)
WHERE room_type = 'classroom'
  AND join_code IS NULL;

INSERT INTO classroom_members (room_id, student_id)
SELECT r.id, u.id
FROM rooms r
CROSS JOIN users u
WHERE r.room_type = 'classroom'
  AND r.code IN ('R101', 'R102')
  AND u.email IN ('student@school.edu', 'student2@school.edu')
ON CONFLICT DO NOTHING;
