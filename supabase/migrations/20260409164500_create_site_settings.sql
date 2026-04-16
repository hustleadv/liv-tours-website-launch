-- Create the site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    google_analytics_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Secure the table with RLS (Row Level Security)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Check if policy exists before creating to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admins can do everything on site_settings'
    ) THEN
        CREATE POLICY "Admins can do everything on site_settings" 
        ON public.site_settings 
        FOR ALL 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
