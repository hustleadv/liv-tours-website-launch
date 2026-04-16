-- Add DELETE policy for bookings table (admins only)
CREATE POLICY "Admins can delete bookings" 
ON public.bookings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));