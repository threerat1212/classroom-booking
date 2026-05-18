CREATE TYPE badge_trigger AS ENUM ('all_assignments_complete', 'on_time_streak', 'highest_score', 'perfect_attendance', 'early_bird');

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    color TEXT,
    trigger_condition badge_trigger,
    criteria JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_badges_trigger ON badges(trigger_condition) WHERE deleted_at IS NULL;

CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    awarded_by UUID REFERENCES users(id),
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX idx_student_badges_badge_id ON student_badges(badge_id);
