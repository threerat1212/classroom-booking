CREATE TYPE attendance_status AS ENUM ('present', 'late', 'leave', 'absent');

CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    room_id UUID REFERENCES rooms(id),
    assignment_id UUID REFERENCES assignments(id),
    title TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_attendance_sessions_teacher_id ON attendance_sessions(teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date) WHERE deleted_at IS NULL;

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id),
    student_id UUID NOT NULL REFERENCES users(id),
    status attendance_status NOT NULL DEFAULT 'absent',
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    notes TEXT,
    marked_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(session_id, student_id)
);

CREATE INDEX idx_attendance_records_session_id ON attendance_records(session_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id) WHERE deleted_at IS NULL;
