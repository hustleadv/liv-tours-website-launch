-- Add final_price and confirmation fields to tour_requests
ALTER TABLE public.tour_requests 
ADD COLUMN IF NOT EXISTS final_price numeric,
ADD COLUMN IF NOT EXISTS price_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS price_confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS confirmation_token text;

-- Create index for confirmation token lookup
CREATE INDEX IF NOT EXISTS idx_tour_requests_confirmation_token 
ON public.tour_requests(confirmation_token) 
WHERE confirmation_token IS NOT NULL;