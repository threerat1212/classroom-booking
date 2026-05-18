-- Fix schema mismatch: recreate grades table, rename notifications.body to message, add attendance session delete support

-- Drop old grade tables
DROP TABLE IF EXISTS student_grades CASCADE;
DROP TABLE IF EXISTS grade_items CASCADE;

-- Create grades table matching service expectations
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    item_type TEXT NOT NULL CHECK (item_type IN ('assignment', 'exam', 'quiz', 'participation')),
    item_id UUID NOT NULL,
    score NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (score >= 0),
    max_score NUMERIC(6,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_grades_student_id ON grades(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grades_item ON grades(item_type, item_id) WHERE deleted_at IS NULL;

-- Fix notifications column name
ALTER TABLE notifications RENAME COLUMN body TO message;
