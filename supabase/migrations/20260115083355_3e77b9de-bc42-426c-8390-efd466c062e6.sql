-- Enable FULL replica identity for real-time updates to work properly
ALTER TABLE public.fixed_prices REPLICA IDENTITY FULL;