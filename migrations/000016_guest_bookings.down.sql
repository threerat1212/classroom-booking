ALTER TABLE bookings
    ALTER COLUMN requester_id SET NOT NULL,
    DROP COLUMN requester_name,
    DROP COLUMN requester_email,
    DROP COLUMN requester_phone;
