CREATE TYPE assignment_type AS ENUM ('individual', 'group');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    room_id UUID REFERENCES rooms(id),
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type assignment_type NOT NULL DEFAULT 'individual',
    max_score NUMERIC(6,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
    rubric JSONB,
    attachments TEXT[] DEFAULT '{}',
    sample_video_url TEXT,
    due_date TIMESTAMPTZ,
    allow_late_submission BOOLEAN NOT NULL DEFAULT false,
    late_penalty_percent NUMERIC(5,2) DEFAULT 0 CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),
    status assignment_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_status ON assignments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_due_date ON assignments(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_room_id ON assignments(room_id) WHERE deleted_at IS NULL;
