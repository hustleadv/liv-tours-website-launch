-- Add new columns for accurate payment tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS deposit_paid numeric;

-- Comment: total_amount = final discounted price, deposit_paid = exact amount paid as deposit
-- Remaining balance = total_amount - deposit_paid