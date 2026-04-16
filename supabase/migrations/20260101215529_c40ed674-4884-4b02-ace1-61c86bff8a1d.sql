-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_session_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.bookings.payment_status IS 'pending, paid, failed, refunded, cash';
COMMENT ON COLUMN public.bookings.payment_type IS 'full, deposit, cash';
COMMENT ON COLUMN public.bookings.payment_amount IS 'Amount paid in EUR';