
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
BEGIN
  -- Clean up expired bookings first
  PERFORM public.cleanup_expired_bookings();
  
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
  
  RETURN QUERY SELECT new_booking_id, booking_expires_at;
END;
$$;
