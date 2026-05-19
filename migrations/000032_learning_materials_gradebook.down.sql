ALTER TABLE grades DROP COLUMN IF EXISTS grade_code;
ALTER TABLE submissions DROP COLUMN IF EXISTS grade_code;

DROP INDEX IF EXISTS idx_learning_materials_teacher_id;
DROP INDEX IF EXISTS idx_learning_materials_classroom_id;
DROP TABLE IF EXISTS learning_materials;

DROP TYPE IF EXISTS learning_material_type;
