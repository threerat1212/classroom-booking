CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE booking_purpose AS ENUM ('class', 'meeting', 'exam', 'event', 'other');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    purpose booking_purpose NOT NULL DEFAULT 'other',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT bookings_time_check CHECK (start_time < end_time),
    CONSTRAINT bookings_not_past_check CHECK (start_time > now() - interval '1 minute')
);

CREATE INDEX idx_bookings_room_id ON bookings(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_requester_id ON bookings(requester_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time) WHERE deleted_at IS NULL;

ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(start_time, end_time, '[]') WITH &&
    )
    WHERE (deleted_at IS NULL AND status IN ('pending', 'approved'));
