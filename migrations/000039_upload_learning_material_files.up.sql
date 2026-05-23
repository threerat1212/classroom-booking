ALTER TABLE files DROP CONSTRAINT IF EXISTS files_entity_type_check;

ALTER TABLE files
ADD CONSTRAINT files_entity_type_check
CHECK (entity_type IN ('submission', 'assignment', 'learning_material', 'room_image', 'avatar', 'export'));
