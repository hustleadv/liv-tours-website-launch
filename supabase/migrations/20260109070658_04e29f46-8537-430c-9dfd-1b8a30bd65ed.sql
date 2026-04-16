-- =====================================================
-- SECURITY FIX: Restrict tour_requests SELECT to admins only
-- This table contains sensitive PII (emails, phones, payment data)
-- =====================================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view tour requests by request_id" ON public.tour_requests;

-- Create new admin-only SELECT policy
CREATE POLICY "Admins can view all tour requests"
ON public.tour_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- CLEANUP: Remove duplicate SELECT policy on bookings
-- Keep only "Admins can view all bookings"
-- =====================================================

-- Drop the redundant policy
DROP POLICY IF EXISTS "Only admins can view bookings directly" ON public.bookings;