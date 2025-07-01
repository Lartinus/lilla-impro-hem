
-- Create table for tracking ticket purchases
CREATE TABLE public.ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_slug TEXT NOT NULL,
  show_title TEXT NOT NULL,
  show_date TEXT NOT NULL,
  show_location TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  regular_tickets INTEGER NOT NULL DEFAULT 0,
  discount_tickets INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  discount_code TEXT,
  ticket_code TEXT UNIQUE NOT NULL,
  qr_data TEXT NOT NULL,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all purchases
CREATE POLICY "Admins can view all ticket purchases"
ON public.ticket_purchases
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for public to insert purchases (during checkout)
CREATE POLICY "Public can insert ticket purchases"
ON public.ticket_purchases
FOR INSERT
WITH CHECK (true);

-- Policy for updating payment status (webhooks)
CREATE POLICY "Can update payment status"
ON public.ticket_purchases
FOR UPDATE
USING (true);

-- Create function to get available tickets for a show
CREATE OR REPLACE FUNCTION public.get_available_tickets(show_slug_param TEXT, total_tickets INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sold_tickets INTEGER;
BEGIN
  SELECT COALESCE(SUM(regular_tickets + discount_tickets), 0)
  INTO sold_tickets
  FROM public.ticket_purchases
  WHERE show_slug = show_slug_param 
    AND payment_status = 'paid';
  
  RETURN GREATEST(0, total_tickets - sold_tickets);
END;
$$;

-- Create function to generate unique ticket code
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.ticket_purchases WHERE ticket_code = code)
    INTO exists_check;
    
    -- If code doesn't exist, break the loop
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;
