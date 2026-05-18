ALTER TABLE bookings
    ALTER COLUMN requester_id DROP NOT NULL,
    ADD COLUMN requester_name TEXT,
    ADD COLUMN requester_email TEXT,
    ADD COLUMN requester_phone TEXT;
