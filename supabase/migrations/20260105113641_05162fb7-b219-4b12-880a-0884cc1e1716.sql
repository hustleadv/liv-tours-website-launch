-- Migrate existing '12+' records to '12-16' tier
-- The '17+' tier will be created as new records when needed

UPDATE public.fixed_prices 
SET vehicle_class = '12-16',
    passengers_max = 16
WHERE vehicle_class = '12+';

-- Add a comment to document the new vehicle class tiers
COMMENT ON COLUMN public.fixed_prices.vehicle_class IS 'Vehicle class tiers: 1-4, 5-8, 9-11, 12-16, 17+';