CREATE TABLE grade_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'assignment',
    max_score NUMERIC(6,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_grade_items_teacher_id ON grade_items(teacher_id) WHERE deleted_at IS NULL;

CREATE TABLE student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_item_id UUID NOT NULL REFERENCES grade_items(id),
    student_id UUID NOT NULL REFERENCES users(id),
    score NUMERIC(6,2) NOT NULL DEFAULT 0,
    feedback TEXT,
    graded_by UUID NOT NULL REFERENCES users(id),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(grade_item_id, student_id)
);

CREATE INDEX idx_student_grades_grade_item_id ON student_grades(grade_item_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_student_grades_student_id ON student_grades(student_id) WHERE deleted_at IS NULL;
