CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'graded', 'late');

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    student_id UUID NOT NULL REFERENCES users(id),
    status submission_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    content TEXT,
    external_links TEXT[] DEFAULT '{}',
    file_ids UUID[] DEFAULT '{}',
    score NUMERIC(6,2),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES users(id),
    feedback TEXT,
    rubric_scores JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_student_id ON submissions(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_status ON submissions(status) WHERE deleted_at IS NULL;
