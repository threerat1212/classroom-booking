CREATE TYPE room_type AS ENUM ('classroom', 'meeting_room', 'lab', 'auditorium');

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    room_type room_type NOT NULL DEFAULT 'classroom',
    capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity > 0),
    floor INTEGER,
    building TEXT,
    description TEXT,
    amenities TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'closed')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_rooms_type ON rooms(room_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_status ON rooms(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_code ON rooms(code) WHERE deleted_at IS NULL;
