-- Create course reservations table for preventing overbookings
CREATE TABLE IF NOT EXISTS public.course_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_instance_id UUID NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course reservations
ALTER TABLE public.course_reservations ENABLE ROW LEVEL SECURITY;

-- Add policies for course reservations
CREATE POLICY "Public can create course reservations"
ON public.course_reservations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view course reservations"
ON public.course_reservations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'superadmin'::text));

-- Create function to cleanup expired course reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_course_reservations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.course_reservations
  WHERE expires_at <= now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to reserve a course spot
CREATE OR REPLACE FUNCTION public.create_course_reservation(
  course_instance_id_param UUID,
  session_id_param TEXT
)
RETURNS TABLE(reservation_id UUID, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_reservation_id UUID;
  reservation_expires_at TIMESTAMPTZ;
  max_participants INTEGER;
  current_bookings INTEGER;
  current_reservations INTEGER;
  table_name_value TEXT;
BEGIN
  -- Clean up expired reservations first
  PERFORM public.cleanup_expired_course_reservations();
  
  -- Get course instance details
  SELECT ci.max_participants, ci.table_name 
  INTO max_participants, table_name_value
  FROM public.course_instances ci
  WHERE ci.id = course_instance_id_param
  AND ci.is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course instance not found or inactive';
  END IF;
  
  -- Check current bookings
  SELECT public.get_course_booking_count(table_name_value) INTO current_bookings;
  
  -- Check current active reservations
  SELECT COUNT(*) INTO current_reservations
  FROM public.course_reservations
  WHERE course_instance_id = course_instance_id_param
  AND expires_at > now();
  
  -- Check if we have space available
  IF (current_bookings + current_reservations + 1) > COALESCE(max_participants, 12) THEN
    RAISE EXCEPTION 'No available spots for this course';
  END IF;
  
  -- Remove any existing reservation for this session
  DELETE FROM public.course_reservations 
  WHERE session_id = session_id_param;
  
  -- Set expiration to 15 minutes from now
  reservation_expires_at := now() + INTERVAL '15 minutes';
  
  -- Insert the new reservation
  INSERT INTO public.course_reservations (
    course_instance_id,
    session_id,
    expires_at
  ) VALUES (
    course_instance_id_param,
    session_id_param,
    reservation_expires_at
  ) RETURNING id INTO new_reservation_id;
  
  RETURN QUERY SELECT new_reservation_id, reservation_expires_at;
END;
$$;

-- Create function to delete course reservation
CREATE OR REPLACE FUNCTION public.delete_course_reservation(session_id_param TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  DELETE FROM public.course_reservations
  WHERE session_id = session_id_param;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Update the get_course_booking_count function to include reservations for better availability checking
CREATE OR REPLACE FUNCTION public.get_course_availability(
  course_instance_id_param UUID
)
RETURNS TABLE(
  max_participants INTEGER,
  current_bookings INTEGER,
  current_reservations INTEGER,
  available_spots INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  max_participants_value INTEGER;
  current_bookings_value INTEGER;
  current_reservations_value INTEGER;
  table_name_value TEXT;
BEGIN
  -- Clean up expired reservations first
  PERFORM public.cleanup_expired_course_reservations();
  
  -- Get course instance details
  SELECT ci.max_participants, ci.table_name 
  INTO max_participants_value, table_name_value
  FROM public.course_instances ci
  WHERE ci.id = course_instance_id_param
  AND ci.is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Get current bookings
  SELECT public.get_course_booking_count(table_name_value) INTO current_bookings_value;
  
  -- Get current active reservations
  SELECT COUNT(*)::INTEGER INTO current_reservations_value
  FROM public.course_reservations
  WHERE course_instance_id = course_instance_id_param
  AND expires_at > now();
  
  RETURN QUERY SELECT 
    COALESCE(max_participants_value, 12),
    COALESCE(current_bookings_value, 0),
    COALESCE(current_reservations_value, 0),
    GREATEST(0, COALESCE(max_participants_value, 12) - COALESCE(current_bookings_value, 0) - COALESCE(current_reservations_value, 0));
END;
$$;