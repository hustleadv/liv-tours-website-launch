-- Add driver fields to tour_requests table
ALTER TABLE public.tour_requests
ADD COLUMN driver_id uuid REFERENCES public.drivers(id),
ADD COLUMN driver_name text,
ADD COLUMN driver_phone text,
ADD COLUMN driver_language text DEFAULT 'en',
ADD COLUMN driver_message_sent boolean DEFAULT false,
ADD COLUMN driver_message_sent_at timestamp with time zone;