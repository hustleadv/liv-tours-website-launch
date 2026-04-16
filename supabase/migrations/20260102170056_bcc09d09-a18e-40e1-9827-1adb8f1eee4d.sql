-- Create table for caching tour fun facts
CREATE TABLE public.tour_fun_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_slug TEXT NOT NULL UNIQUE,
  primary_stop_name TEXT,
  fun_fact_text TEXT,
  fun_fact_source_url TEXT,
  fun_fact_last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_fun_facts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (fun facts are public content)
CREATE POLICY "Fun facts are publicly readable"
ON public.tour_fun_facts
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_tour_fun_facts_updated_at
BEFORE UPDATE ON public.tour_fun_facts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();