-- Enable REPLICA IDENTITY FULL for complete row data on updates
ALTER TABLE public.bookings REPLICA IDENTITY FULL;