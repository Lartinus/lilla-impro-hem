
-- Update the create_ticket_booking function to handle existing bookings for the same session_id
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
  current_available INTEGER;
  total_requested INTEGER;
BEGIN
  -- Clean up expired bookings first
  PERFORM public.cleanup_expired_bookings();
  
  -- Calculate total requested tickets
  total_requested := regular_tickets_param + discount_tickets_param;
  
  -- Log the booking attempt (this will appear in database logs)
  RAISE NOTICE 'Attempting to create booking for show: %, total tickets: %, session: %', 
    show_slug_param, total_requested, session_id_param;
  
  -- Remove any existing booking for this session_id to avoid duplicate key error
  DELETE FROM public.ticket_bookings 
  WHERE session_id = session_id_param;
  
  -- Set expiration to 10 minutes from now
  booking_expires_at := now() + INTERVAL '10 minutes';
  
  -- Insert the new booking
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
  
  RAISE NOTICE 'Successfully created booking with ID: %', new_booking_id;
  
  RETURN QUERY SELECT new_booking_id, booking_expires_at;
END;
$$;

-- Update the get_available_tickets_with_bookings function to include better logging
CREATE OR REPLACE FUNCTION public.get_available_tickets_with_bookings(show_slug_param TEXT, total_tickets INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sold_tickets INTEGER;
  booked_tickets INTEGER;
  available_tickets INTEGER;
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
  
  available_tickets := GREATEST(0, total_tickets - sold_tickets - booked_tickets);
  
  -- Log the calculation (this will appear in database logs)
  RAISE NOTICE 'Tickets calculation for %: total=%, sold=%, booked=%, available=%', 
    show_slug_param, total_tickets, sold_tickets, booked_tickets, available_tickets;
  
  RETURN available_tickets;
END;
$$;
