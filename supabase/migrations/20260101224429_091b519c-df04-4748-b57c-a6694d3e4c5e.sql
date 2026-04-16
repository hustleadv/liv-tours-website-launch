-- Create tour_requests table for storing custom tour inquiries
CREATE TABLE public.tour_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Tour details
  tour_vibe TEXT,
  itinerary_title TEXT,
  pickup_area TEXT,
  duration TEXT,
  group_size TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  addons TEXT[],
  
  -- Pricing
  estimated_total NUMERIC,
  deposit_amount NUMERIC,
  discount_applied BOOLEAN DEFAULT false,
  discount_amount NUMERIC DEFAULT 0,
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT DEFAULT 'deposit',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create tour requests" 
ON public.tour_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view tour requests by request_id" 
ON public.tour_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update tour requests" 
ON public.tour_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tour requests" 
ON public.tour_requests 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_tour_requests_updated_at
BEFORE UPDATE ON public.tour_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_tour_requests_request_id ON public.tour_requests(request_id);
CREATE INDEX idx_tour_requests_customer_email ON public.tour_requests(customer_email);
CREATE INDEX idx_tour_requests_status ON public.tour_requests(status);