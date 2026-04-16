-- Create location_aliases table for managing dropoff/pickup name mappings
CREATE TABLE public.location_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alias TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'dropoff' CHECK (location_type IN ('dropoff', 'pickup')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(alias, location_type)
);

-- Enable RLS
ALTER TABLE public.location_aliases ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read aliases (needed for price lookups)
CREATE POLICY "Anyone can view location aliases" 
ON public.location_aliases 
FOR SELECT 
USING (true);

-- Only admins can manage aliases
CREATE POLICY "Admins can insert location aliases" 
ON public.location_aliases 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update location aliases" 
ON public.location_aliases 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete location aliases" 
ON public.location_aliases 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_location_aliases_updated_at
BEFORE UPDATE ON public.location_aliases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial aliases based on current hardcoded values
INSERT INTO public.location_aliases (alias, canonical_name, location_type) VALUES
('chania old town', 'Chania City', 'dropoff'),
('chania center', 'Chania City', 'dropoff'),
('chania city center', 'Chania City', 'dropoff'),
('old town chania', 'Chania City', 'dropoff'),
('χανιά', 'Chania City', 'dropoff'),
('παλιά πόλη χανίων', 'Chania City', 'dropoff'),
('rethymno old town', 'Rethymno City', 'dropoff'),
('rethymno center', 'Rethymno City', 'dropoff'),
('heraklion old town', 'Heraklion City', 'dropoff'),
('heraklion center', 'Heraklion City', 'dropoff');