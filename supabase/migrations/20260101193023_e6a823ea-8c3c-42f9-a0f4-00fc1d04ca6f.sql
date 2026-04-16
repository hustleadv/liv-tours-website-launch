-- Add driver language to drivers table
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Add driver_message_sent to bookings table to track if driver has been notified
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS driver_message_sent boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS driver_message_sent_at timestamp with time zone;

-- Add driver_language to bookings table (denormalized for quick access)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS driver_language text;