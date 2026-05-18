INSERT INTO users (id, email, password_hash, full_name, role, student_id, employee_id, department, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@school.edu', '$2b$10$DMrdX3ymJfK7TwUdzbWASuVTIsHVyhv4vaWY5BGC1YoIL58jr83hG', 'System Administrator', 'admin', NULL, 'EMP001', 'IT', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'teacher@school.edu', '$2b$10$QuwGKl07fBvmrja9MLqTZec14HtY6tb6r.86q9wW4BX8itUlltyVO', 'John Smith', 'teacher', NULL, 'EMP002', 'Mathematics', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'student@school.edu', '$2b$10$sGVKhNRGw548pY2YkizNy.j/NAPJwy5qgGMVhhTuGKH3mIHeigsmi', 'Alice Johnson', 'student', 'STU001', NULL, NULL, 'active'),
    ('44444444-4444-4444-4444-444444444444', 'student2@school.edu', '$2b$10$sGVKhNRGw548pY2YkizNy.j/NAPJwy5qgGMVhhTuGKH3mIHeigsmi', 'Bob Williams', 'student', 'STU002', NULL, NULL, 'active'),
    ('55555555-5555-5555-5555-555555555555', 'guest@school.edu', '$2b$10$CrJQsTM.wZinP5O/P/1KbO1.tLdkJ9SOXa3oOvw.cpWoIvzzYMiAC', 'Guest User', 'guest', NULL, NULL, NULL, 'active');

INSERT INTO rooms (id, name, code, room_type, capacity, floor, building, description, amenities, status)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Room 101', 'R101', 'classroom', 40, 1, 'Building A', 'Standard classroom with projector', ARRAY['projector', 'whiteboard', 'air_conditioner'], 'available'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Room 102', 'R102', 'classroom', 40, 1, 'Building A', 'Standard classroom', ARRAY['projector', 'whiteboard'], 'available'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Meeting Room A', 'MRA', 'meeting_room', 15, 2, 'Building B', 'Small meeting room', ARRAY['tv', 'whiteboard', 'video_conference'], 'available'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Computer Lab 1', 'LAB1', 'lab', 30, 1, 'Building C', 'Computer lab with 30 workstations', ARRAY['computers', 'projector', 'air_conditioner'], 'available'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Auditorium', 'AUD', 'auditorium', 200, 1, 'Main Hall', 'Large auditorium for events', ARRAY['projector', 'sound_system', 'stage', 'air_conditioner'], 'available');

INSERT INTO badges (id, name, description, icon_url, color, trigger_condition, criteria)
VALUES
    ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'All Complete', 'Submitted all assignments', 'trophy', 'gold', 'all_assignments_complete', '{"min_count": 0}'),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'On Time', 'Submitted 5 assignments on time', 'clock', 'blue', 'on_time_streak', '{"streak": 5}'),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'Top Scorer', 'Achieved highest score on an assignment', 'medal', 'green', 'highest_score', '{}'),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Perfect Attendance', 'No absences for a full month', 'calendar', 'purple', 'perfect_attendance', '{"period_days": 30}'),
    ('f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', 'Early Bird', 'Submitted before due date', 'bird', 'orange', 'early_bird', '{}');
