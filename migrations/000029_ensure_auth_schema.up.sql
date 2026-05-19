-- Idempotent safeguard for auth schema.
-- Previous migrations (000025, 000026, 000028) include seed-data INSERTs with
-- invalid UUIDs (e.g. 'xp000001-...', 'as000001-...'). Those statements abort
-- the migration and leave the schema in an unknown state on some deploys.
-- This migration re-applies the structural changes only — no demo data — so
-- the users SELECT / RETURNING in login/register always has the columns it
-- needs.

ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0);
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_title TEXT;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE IF NOT EXISTS xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at);

-- learning_quests / quest_attempts (from 000028) — same idempotent guard
DO $$ BEGIN
    CREATE TYPE quest_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quest_status AS ENUM ('active', 'locked', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS learning_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    description TEXT,
    difficulty quest_difficulty NOT NULL DEFAULT 'easy',
    question TEXT NOT NULL,
    answer TEXT,
    hints TEXT[] DEFAULT '{}',
    explanation TEXT,
    exp_reward INTEGER NOT NULL DEFAULT 10 CHECK (exp_reward > 0),
    time_limit_minutes INTEGER,
    status quest_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_quests_teacher ON learning_quests(teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_quests_status ON learning_quests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_quests_difficulty ON learning_quests(difficulty) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS quest_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID NOT NULL REFERENCES learning_quests(id),
    student_id UUID NOT NULL REFERENCES users(id),
    answer TEXT,
    is_correct BOOLEAN,
    score INTEGER CHECK (score >= 0),
    feedback TEXT,
    exp_earned INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(quest_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_quest_attempts_student ON quest_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempts_quest ON quest_attempts(quest_id);
