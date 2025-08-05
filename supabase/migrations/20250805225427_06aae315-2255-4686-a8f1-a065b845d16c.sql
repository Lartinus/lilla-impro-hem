-- Convert existing total_amount from SEK to öre in ticket_purchases table
UPDATE public.ticket_purchases 
SET total_amount = total_amount * 100 
WHERE total_amount < 10000; -- Only update values that seem to be in SEK (less than 100 SEK)

-- Add comment to clarify the total_amount column stores values in öre
COMMENT ON COLUMN public.ticket_purchases.total_amount IS 'Total amount in öre (1 SEK = 100 öre)';