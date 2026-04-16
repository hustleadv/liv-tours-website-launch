-- First drop the default, then change type
ALTER TABLE public.bookings 
  ALTER COLUMN child_seat DROP DEFAULT;

ALTER TABLE public.bookings 
  ALTER COLUMN child_seat TYPE integer USING CASE WHEN child_seat THEN 1 ELSE 0 END;

ALTER TABLE public.bookings 
  ALTER COLUMN child_seat SET DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.bookings.child_seat IS 'Number of child seats requested (0 = none)';