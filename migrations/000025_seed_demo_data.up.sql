-- Demo data for student + teacher testing
-- Uses existing seed users: teacher@school.edu (teacher), student@school.edu (student)
-- Uses existing rooms from 000012_seed

-- ============================================
-- 1. Bookings: student requests room for study, teacher approves
-- ============================================
INSERT INTO bookings (id, room_id, requester_id, approver_id, title, description, purpose, start_time, end_time, status, approved_at, created_at, updated_at)
VALUES
    ('b0000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Math Study Group', 'Group study session for calculus exam', 'class', now() + interval '2 days', now() + interval '2 days 2 hours', 'approved', now(), now(), now()),
    ('b0000001-0001-0001-0001-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', NULL, 'Project Meeting', 'Final project discussion with team', 'meeting', now() + interval '3 days', now() + interval '3 days 1 hour', 'pending', NULL, now(), now()),
    ('b0000001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Computer Lab Practice', 'Programming lab practice session', 'class', now() + interval '1 day', now() + interval '1 day 3 hours', 'approved', now(), now(), now());

-- ============================================
-- 2. Assignments (Subjects): teacher creates assignments for students
-- ============================================
INSERT INTO assignments (id, teacher_id, room_id, title, description, instructions, assignment_type, max_score, due_date, allow_late_submission, late_penalty_percent, status, published_at, created_at, updated_at)
VALUES
    ('as000001-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics - Calculus I', 'Introduction to limits and derivatives', 'Complete exercises 1-20 from Chapter 3. Show all your work.', 'individual', 100, now() + interval '5 days', true, 10, 'published', now(), now(), now()),
    ('as000001-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Physics - Mechanics', 'Newton\'s laws of motion and applications', 'Solve 10 word problems related to Newton\'s laws. Submit as PDF.', 'individual', 100, now() + interval '7 days', true, 15, 'published', now(), now(), now()),
    ('as000001-0001-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Computer Science - Algorithms', 'Sorting algorithms and time complexity analysis', 'Implement merge sort and quicksort in Python. Compare performance.', 'individual', 100, now() + interval '10 days', false, 0, 'published', now(), now(), now()),
    ('as000001-0001-0001-0001-000000000004', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'English - Essay Writing', 'Write a 500-word essay on climate change', 'Research and write a persuasive essay. Use at least 3 sources.', 'individual', 100, now() + interval '4 days', true, 20, 'published', now(), now(), now()),
    ('as000001-0001-0001-0001-000000000005', '22222222-2222-2222-2222-222222222222', NULL, 'Group Project - Science Fair', 'Prepare a science fair presentation with your group', 'Create a poster and 5-minute presentation. All members must participate.', 'group', 100, now() + interval '14 days', false, 0, 'published', now(), now(), now());

-- ============================================
-- 3. Submissions: student submits completed assignments
-- ============================================
INSERT INTO submissions (id, assignment_id, student_id, status, submitted_at, content, score, graded_at, graded_by, feedback, created_at, updated_at)
VALUES
    ('su000001-0001-0001-0001-000000000001', 'as000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'graded', now() - interval '2 days', 'Completed all 20 exercises. Work shown in attached PDF.', 85.50, now() - interval '1 day', '22222222-2222-2222-2222-222222222222', 'Good work on limits. Need more practice on chain rule. #13 and #17 incorrect.', now() - interval '2 days', now() - interval '1 day'),
    ('su000001-0001-0001-0001-000000000002', 'as000001-0001-0001-0001-000000000004', '33333333-3333-3333-3333-333333333333', 'graded', now() - interval '3 days', 'Essay on climate change impacts in Southeast Asia. 3 sources cited in APA format.', 92.00, now() - interval '2 days', '22222222-2222-2222-2222-222222222222', 'Excellent research and structure. Strong conclusion. Minor grammar issues.', now() - interval '3 days', now() - interval '2 days'),
    ('su000001-0001-0001-0001-000000000003', 'as000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'submitted', now() - interval '1 day', 'Completed all 10 physics problems with diagrams and step-by-step solutions.', NULL, NULL, NULL, NULL, now() - interval '1 day', now() - interval '1 day'),
    ('su000001-0001-0001-0001-000000000004', 'as000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'draft', NULL, 'Work in progress - implementing merge sort currently.', NULL, NULL, NULL, NULL, now(), now()),
    ('su000001-0001-0001-0001-000000000005', 'as000001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'graded', now() - interval '2 days', 'All exercises completed with detailed work shown.', 78.00, now() - interval '1 day', '22222222-2222-2222-2222-222222222222', 'Satisfactory work. Review derivative rules before next quiz.', now() - interval '2 days', now() - interval '1 day');

-- ============================================
-- 4. Attendance Sessions: teacher creates class sessions
-- ============================================
INSERT INTO attendance_sessions (id, teacher_id, room_id, assignment_id, title, session_date, start_time, end_time, description, status, qr_code, created_at, updated_at)
VALUES
    ('at000001-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'as000001-0001-0001-0001-000000000001', 'Calculus I - Week 5', current_date - interval '3 days', '09:00:00', '11:00:00', 'Limits and continuity review', 'open', NULL, now(), now()),
    ('at000001-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'as000001-0001-0001-0001-000000000001', 'Calculus I - Week 6', current_date - interval '1 day', '09:00:00', '11:00:00', 'Introduction to derivatives', 'open', NULL, now(), now()),
    ('at000001-0001-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'as000001-0001-0001-0001-000000000002', 'Physics - Week 4', current_date - interval '2 days', '13:00:00', '15:00:00', 'Newton\'s Second Law lab', 'open', NULL, now(), now()),
    ('at000001-0001-0001-0001-000000000004', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'as000001-0001-0001-0001-000000000003', 'CS Lab - Sorting Algorithms', current_date, '10:00:00', '12:00:00', 'Hands-on implementation of sorting algorithms', 'open', NULL, now(), now());

-- ============================================
-- 5. Attendance Records: mark student present/late/absent
-- ============================================
INSERT INTO attendance_records (id, session_id, student_id, status, check_in_at, check_out_at, notes, marked_by, created_at, updated_at)
VALUES
    ('ar000001-0001-0001-0001-000000000001', 'at000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'present', (current_date - interval '3 days') + interval '9 hours', (current_date - interval '3 days') + interval '11 hours', NULL, '22222222-2222-2222-2222-222222222222', now(), now()),
    ('ar000001-0001-0001-0001-000000000002', 'at000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'present', (current_date - interval '1 day') + interval '9 hours 5 minutes', (current_date - interval '1 day') + interval '11 hours', 'Arrived slightly late', '22222222-2222-2222-2222-222222222222', now(), now()),
    ('ar000001-0001-0001-0001-000000000003', 'at000001-0001-0001-0001-000000000002', '44444444-4444-4444-4444-444444444444', 'present', (current_date - interval '1 day') + interval '9 hours', (current_date - interval '1 day') + interval '11 hours', NULL, '22222222-2222-2222-2222-222222222222', now(), now()),
    ('ar000001-0001-0001-0001-000000000004', 'at000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'late', (current_date - interval '2 days') + interval '13 hours 15 minutes', (current_date - interval '2 days') + interval '15 hours', 'Traffic delay', '22222222-2222-2222-2222-222222222222', now(), now()),
    ('ar000001-0001-0001-0001-000000000005', 'at000001-0001-0001-0001-000000000004', '33333333-3333-3333-3333-333333333333', 'present', current_date + interval '10 hours', current_date + interval '12 hours', NULL, '22222222-2222-2222-2222-222222222222', now(), now());

-- ============================================
-- 6. Grades: teacher grades student on various items
-- ============================================
INSERT INTO grades (id, student_id, item_type, item_id, score, max_score, feedback, graded_by, created_at, updated_at)
VALUES
    ('gr000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'assignment', 'as000001-0001-0001-0001-000000000001', 85.50, 100, 'Good work on limits. Need more practice on chain rule.', '22222222-2222-2222-2222-222222222222', now() - interval '1 day', now() - interval '1 day'),
    ('gr000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'assignment', 'as000001-0001-0001-0001-000000000004', 92.00, 100, 'Excellent essay. Strong research and persuasive arguments.', '22222222-2222-2222-2222-222222222222', now() - interval '2 days', now() - interval '2 days'),
    ('gr000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'quiz', gen_random_uuid(), 88.00, 100, 'Quiz 2 - Linear equations', '22222222-2222-2222-2222-222222222222', now() - interval '5 days', now() - interval '5 days'),
    ('gr000001-0001-0001-0001-000000000004', '44444444-4444-4444-4444-444444444444', 'assignment', 'as000001-0001-0001-0001-000000000001', 78.00, 100, 'Satisfactory work. Review derivative rules.', '22222222-2222-2222-2222-222222222222', now() - interval '1 day', now() - interval '1 day'),
    ('gr000001-0001-0001-0001-000000000005', '44444444-4444-4444-4444-444444444444', 'exam', gen_random_uuid(), 91.00, 100, 'Midterm exam - Strong performance', '22222222-2222-2222-2222-222222222222', now() - interval '10 days', now() - interval '10 days');

-- ============================================
-- 7. Notifications for student
-- ============================================
INSERT INTO notifications (id, user_id, title, message, type, is_read, link, created_at, updated_at)
VALUES
    ('nt000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'Assignment Graded', 'Your Calculus I assignment has been graded. Score: 85.50/100', 'assignment', false, '/student/assignments', now() - interval '1 day', now() - interval '1 day'),
    ('nt000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'New Assignment Published', 'New assignment: Physics - Mechanics. Due in 7 days.', 'assignment', false, '/student/assignments', now() - interval '2 days', now() - interval '2 days'),
    ('nt000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'Booking Approved', 'Your booking for Room 101 (Math Study Group) has been approved.', 'booking', true, '/bookings', now() - interval '1 day', now() - interval '1 day'),
    ('nt000001-0001-0001-0001-000000000004', '33333333-3333-3333-3333-333333333333', 'Attendance Marked Late', 'You were marked late for Physics class. Reason: Traffic delay.', 'attendance', false, '/attendance', now() - interval '2 days', now() - interval '2 days'),
    ('nt000001-0001-0001-0001-000000000005', '33333333-3333-3333-3333-333333333333', 'New Grade Posted', 'Your English essay received 92.00/100. Great job!', 'grade', false, '/grades', now() - interval '2 days', now() - interval '2 days');

-- ============================================
-- 8. Student Badges (awarded)
-- ============================================
INSERT INTO student_badges (id, student_id, badge_id, awarded_by, context, created_at)
VALUES
    ('sb000001-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '22222222-2222-2222-2222-222222222222', '{"assignment_count": 5}', now() - interval '3 days'),
    ('sb000001-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', '22222222-2222-2222-2222-222222222222', '{"days_early": 2}', now() - interval '2 days');
