-- Create RPC function to count course bookings in dynamic tables
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  booking_count INTEGER;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Count rows in the specified table
  EXECUTE format('SELECT COUNT(*)::integer FROM public.%I', table_name) 
  INTO booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- Return 0 on any error to avoid breaking the UI
    RETURN 0;
END;
$function$;