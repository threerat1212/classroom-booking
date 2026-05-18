-- Add file_urls and external_link columns to submissions for service compatibility

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_urls TEXT[] DEFAULT '{}';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS external_link TEXT;

-- Allow attendance_sessions title to default to empty string for backwards compat
ALTER TABLE attendance_sessions ALTER COLUMN title SET DEFAULT '';
