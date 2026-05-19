-- Add XP and level columns to users for gamification
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0);
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_title TEXT;

-- Create XP history log table
CREATE TABLE xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX idx_xp_history_created_at ON xp_history(created_at);

-- Seed XP for demo students (Alice = 350 XP, Bob = 280 XP)
UPDATE users SET xp = 350, level = 4, rank_title = 'Apprentice' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE users SET xp = 280, level = 3, rank_title = 'Apprentice' WHERE id = '44444444-4444-4444-4444-444444444444';

-- Seed XP history for demo data
INSERT INTO xp_history (id, user_id, action, xp_amount, description, reference_type, created_at)
VALUES
    ('a5000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'submission_graded', 85, 'Calculus I assignment graded: 85.50/100', 'submission', now() - interval '2 days'),
    ('a5000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'submission_graded', 92, 'English essay graded: 92.00/100', 'submission', now() - interval '3 days'),
    ('a5000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'submission_submitted', 10, 'Physics assignment submitted', 'submission', now() - interval '1 day'),
    ('a5000001-0001-0001-0001-000000000004', '33333333-3333-3333-3333-333333333333', 'attendance_present', 5, 'Present at Calculus I class', 'attendance', now() - interval '3 days'),
    ('a5000001-0001-0001-0001-000000000005', '33333333-3333-3333-3333-333333333333', 'attendance_present', 5, 'Present at Calculus I class', 'attendance', now() - interval '1 day'),
    ('a5000001-0001-0001-0001-000000000006', '33333333-3333-3333-3333-333333333333', 'attendance_late', 2, 'Late for Physics class', 'attendance', now() - interval '2 days'),
    ('a5000001-0001-0001-0001-000000000007', '33333333-3333-3333-3333-333333333333', 'badge_earned', 50, 'Earned Early Bird badge', 'badge', now() - interval '2 days'),
    ('a5000001-0001-0001-0001-000000000008', '44444444-4444-4444-4444-444444444444', 'submission_graded', 78, 'Calculus I assignment graded: 78.00/100', 'submission', now() - interval '2 days'),
    ('a5000001-0001-0001-0001-000000000009', '44444444-4444-4444-4444-444444444444', 'attendance_present', 5, 'Present at Calculus I class', 'attendance', now() - interval '1 day');
