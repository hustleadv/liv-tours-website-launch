-- Drop the insecure policy that allows anyone to view all bookings
DROP POLICY IF EXISTS "Users can view their booking by email" ON public.bookings;

-- Create a more restrictive SELECT policy
-- Only admins can view all bookings, or users can view by matching a secure token
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create a policy for public access with booking_id (for Trip Hub lookup)
-- This requires knowing the specific booking_id which acts as a secret token
CREATE POLICY "Anyone can view booking by booking_id" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Actually, let's be more secure - we need a different approach
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view booking by booking_id" ON public.bookings;

-- Create a function to check booking access securely
CREATE OR REPLACE FUNCTION public.can_access_booking(booking_row bookings)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins can always access
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN true;
  END IF;
  
  -- For unauthenticated users, deny access (they should use the edge function)
  RETURN false;
END;
$$;

-- Create secure SELECT policy - only admins via direct DB access
CREATE POLICY "Only admins can view bookings directly" 
ON public.bookings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));