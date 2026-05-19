DELETE FROM learning_quests
WHERE quest_kind = 'special'
  AND required_title_code IN ('first_step', 'precision_solver')
  AND title IN ('เควสลับ: ประตูนักผจญภัย', 'เควสลับ: ห้องทดสอบความแม่นยำ');

ALTER TABLE learning_quests
DROP COLUMN IF EXISTS unlock_note,
DROP COLUMN IF EXISTS required_title_code,
DROP COLUMN IF EXISTS quest_kind;

DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS user_titles;
DROP TABLE IF EXISTS unique_title_claims;
DROP TABLE IF EXISTS learning_achievements;
DROP TABLE IF EXISTS learning_titles;
