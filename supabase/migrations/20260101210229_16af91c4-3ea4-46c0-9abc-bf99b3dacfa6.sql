-- Create enums for tours
CREATE TYPE tour_status AS ENUM ('draft', 'published');
CREATE TYPE tour_region AS ENUM ('Chania', 'Rethymno', 'Heraklion', 'Lasithi');
CREATE TYPE tour_category AS ENUM ('Beach', 'Nature', 'Culture', 'Food', 'Family', 'Adventure');
CREATE TYPE tour_time_type AS ENUM ('Half day', 'Full day');
CREATE TYPE tour_difficulty AS ENUM ('Easy', 'Moderate');
CREATE TYPE tour_walking_level AS ENUM ('Low', 'Medium');

-- Create tours table
CREATE TABLE public.tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status tour_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region tour_region NOT NULL,
  category tour_category NOT NULL,
  duration_hours NUMERIC NOT NULL DEFAULT 4,
  time_type tour_time_type NOT NULL DEFAULT 'Half day',
  difficulty tour_difficulty NOT NULL DEFAULT 'Easy',
  walking_level tour_walking_level NOT NULL DEFAULT 'Low',
  best_for TEXT[] NOT NULL DEFAULT '{}',
  price_from_eur NUMERIC,
  includes TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  short_teaser TEXT,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  weather_fit TEXT[] NOT NULL DEFAULT '{}',
  seasonality TEXT[] NOT NULL DEFAULT '{"all_year"}',
  pickup_options TEXT[] NOT NULL DEFAULT '{}',
  stops JSONB NOT NULL DEFAULT '[]',
  images JSONB NOT NULL DEFAULT '{"cover_url": null, "gallery_urls": []}',
  popular_score NUMERIC DEFAULT 0,
  source_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- Public can view published tours only
CREATE POLICY "Anyone can view published tours"
ON public.tours
FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can select all tours"
ON public.tours
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tours"
ON public.tours
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tours"
ON public.tours
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tours"
ON public.tours
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_tours_status ON public.tours(status);
CREATE INDEX idx_tours_region ON public.tours(region);
CREATE INDEX idx_tours_category ON public.tours(category);
CREATE INDEX idx_tours_slug ON public.tours(slug);
CREATE INDEX idx_tours_tags ON public.tours USING GIN(tags);