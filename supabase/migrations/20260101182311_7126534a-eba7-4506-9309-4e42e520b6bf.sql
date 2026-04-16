-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for location local tips with caching
CREATE TABLE public.location_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id TEXT NOT NULL UNIQUE,
  location_name TEXT NOT NULL,
  lat DECIMAL(10, 6),
  lon DECIMAL(10, 6),
  location_type TEXT DEFAULT 'general',
  
  -- Tip data
  tip_text TEXT,
  source_summary TEXT,
  confidence DECIMAL(3, 2) DEFAULT 0.5,
  
  -- Manual override
  manual_tip TEXT,
  is_manual_override BOOLEAN DEFAULT false,
  
  -- Status and caching
  status TEXT DEFAULT 'pending',
  last_updated TIMESTAMP WITH TIME ZONE,
  last_generation_attempt TIMESTAMP WITH TIME ZONE,
  generation_error TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.location_tips ENABLE ROW LEVEL SECURITY;

-- Everyone can read tips
CREATE POLICY "Anyone can view location tips"
ON public.location_tips
FOR SELECT
USING (true);

-- Only admins can manage tips (insert/update/delete)
CREATE POLICY "Admins can insert location tips"
ON public.location_tips
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update location tips"
ON public.location_tips
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete location tips"
ON public.location_tips
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_location_tips_location_id ON public.location_tips(location_id);
CREATE INDEX idx_location_tips_status ON public.location_tips(status);

-- Trigger for updated_at
CREATE TRIGGER update_location_tips_updated_at
BEFORE UPDATE ON public.location_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();