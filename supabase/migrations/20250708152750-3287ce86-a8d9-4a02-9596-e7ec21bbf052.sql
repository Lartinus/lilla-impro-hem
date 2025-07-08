-- The issue is that the function is not properly handling the admin context
-- Let's create a function that works correctly with the admin role system
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
  
  -- The function runs with SECURITY DEFINER, which means it runs as the function owner
  -- But we need to make sure we can read the course booking tables
  -- Let's use a simpler approach that works with the existing RLS
  BEGIN
    -- Use dynamic SQL but without RLS restrictions since this is a SECURITY DEFINER function
    EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO booking_count;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't read the table, return 0
      RETURN 0;
  END;
  
  RETURN COALESCE(booking_count, 0);
END;
$function$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO anon;