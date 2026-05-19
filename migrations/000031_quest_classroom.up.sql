-- Scope learning quests to a specific classroom.
-- A quest with classroom_id = NULL is "global" (visible to all enrolled
-- students of any classroom) -- only kept for legacy demo seeds.
-- New quests created via the teacher UI must specify a classroom_id.

ALTER TABLE learning_quests
    ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES rooms(id);

CREATE INDEX IF NOT EXISTS idx_learning_quests_classroom
    ON learning_quests(classroom_id)
    WHERE deleted_at IS NULL;
