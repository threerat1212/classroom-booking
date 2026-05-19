DROP INDEX IF EXISTS idx_learning_quests_classroom;
ALTER TABLE learning_quests DROP COLUMN IF EXISTS classroom_id;
