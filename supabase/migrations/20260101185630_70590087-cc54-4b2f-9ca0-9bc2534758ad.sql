-- Add driver contact columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN driver_name text,
ADD COLUMN driver_phone text;