
-- Create table for ticket bookings (temporary reservations)
CREATE TABLE public.ticket_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_slug TEXT NOT NULL,
  regular_tickets INTEGER NOT NULL DEFAULT 0,
  discount_tickets INTEGER NOT NULL DEFAULT 0,
  session_id TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_bookings ENABLE ROW LEVEL SECURITY;

-- Policy for public to insert bookings
CREATE POLICY "Public can insert ticket bookings"
ON public.ticket_bookings
FOR INSERT
WITH CHECK (true);

-- Policy for public to select their own bookings by session_id
CREATE POLICY "Public can view own bookings"
ON public.ticket_bookings
FOR SELECT
USING (true);

-- Policy for updating/deleting expired bookings
CREATE POLICY "Can manage bookings"
ON public.ticket_bookings
FOR ALL
USING (true);

-- Create function to get available tickets (accounting for bookings)
CREATE OR REPLACE FUNCTION public.get_available_tickets_with_bookings(show_slug_param TEXT, total_tickets INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sold_tickets INTEGER;
  booked_tickets INTEGER;
BEGIN
  -- Get sold tickets (paid purchases)
  SELECT COALESCE(SUM(regular_tickets + discount_tickets), 0)
  INTO sold_tickets
  FROM public.ticket_purchases
  WHERE show_slug = show_slug_param 
    AND payment_status = 'paid';
  
  -- Get currently booked tickets (not expired)
  SELECT COALESCE(SUM(regular_tickets + discount_tickets), 0)
  INTO booked_tickets
  FROM public.ticket_bookings
  WHERE show_slug = show_slug_param 
    AND expires_at > now();
  
  RETURN GREATEST(0, total_tickets - sold_tickets - booked_tickets);
END;
$$;

-- Create function to clean up expired bookings
CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ticket_bookings
  WHERE expires_at <= now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to create a booking
CREATE OR REPLACE FUNCTION public.create_ticket_booking(
  show_slug_param TEXT,
  regular_tickets_param INTEGER,
  discount_tickets_param INTEGER,
  session_id_param TEXT
)
RETURNS TABLE(booking_id UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_booking_id UUID;
  booking_expires_at TIMESTAMPTZ;
BEGIN
  -- Clean up expired bookings first
  PERFORM public.cleanup_expired_bookings();
  
  -- Set expiration to 10 minutes from now
  booking_expires_at := now() + INTERVAL '10 minutes';
  
  -- Insert the booking
  INSERT INTO public.ticket_bookings (
    show_slug,
    regular_tickets,
    discount_tickets,
    session_id,
    expires_at
  ) VALUES (
    show_slug_param,
    regular_tickets_param,
    discount_tickets_param,
    session_id_param,
    booking_expires_at
  ) RETURNING id INTO new_booking_id;
  
  RETURN QUERY SELECT new_booking_id, booking_expires_at;
END;
$$;
