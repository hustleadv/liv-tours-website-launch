-- Create fixed_prices table for taxi/minibus pricing
CREATE TABLE public.fixed_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  pickup_zone TEXT NOT NULL,
  dropoff_name TEXT NOT NULL,
  vehicle_class TEXT NOT NULL DEFAULT 'Taxi',
  passengers_min INTEGER NOT NULL DEFAULT 1,
  passengers_max INTEGER NOT NULL DEFAULT 4,
  fixed_price_eur DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_fixed_price BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE (pickup_zone, dropoff_name, vehicle_class, passengers_max)
);

-- Enable RLS
ALTER TABLE public.fixed_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can read prices (public data)
CREATE POLICY "Anyone can view fixed prices"
ON public.fixed_prices
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert fixed prices"
ON public.fixed_prices
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update fixed prices"
ON public.fixed_prices
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete fixed prices"
ON public.fixed_prices
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_fixed_prices_updated_at
BEFORE UPDATE ON public.fixed_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast lookups
CREATE INDEX idx_fixed_prices_lookup ON public.fixed_prices (pickup_zone, dropoff_name, vehicle_class);
CREATE INDEX idx_fixed_prices_region ON public.fixed_prices (region);
CREATE INDEX idx_fixed_prices_dropoff ON public.fixed_prices (dropoff_name);