-- No-op: this migration only adds idempotent guards on top of earlier
-- migrations. Reverting it would risk dropping schema/data that 000026 /
-- 000028 created. Use those migrations' own .down.sql to roll back.
SELECT 1;
