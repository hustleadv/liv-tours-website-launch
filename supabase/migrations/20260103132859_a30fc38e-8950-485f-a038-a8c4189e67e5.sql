-- Enable realtime for fixed_prices table
ALTER TABLE public.fixed_prices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fixed_prices;