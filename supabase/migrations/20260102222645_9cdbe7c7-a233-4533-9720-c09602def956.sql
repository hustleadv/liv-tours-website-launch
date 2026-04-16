-- Create table for communication history
CREATE TABLE public.booking_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL, -- 'whatsapp', 'call', 'email', 'sms'
  initiated_by TEXT, -- driver name or admin
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_communications ENABLE ROW LEVEL SECURITY;

-- Policies for admin users
CREATE POLICY "Admins can view communication history" 
ON public.booking_communications 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert communication history" 
ON public.booking_communications 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete communication history" 
ON public.booking_communications 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_communications;