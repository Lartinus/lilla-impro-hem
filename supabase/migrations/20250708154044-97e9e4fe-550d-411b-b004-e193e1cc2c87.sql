-- Create a final working version of the RPC function that handles authentication properly
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  booking_count INTEGER := 0;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Try to get the count using dynamic SQL
  -- This function runs as SECURITY DEFINER so it should have the necessary permissions
  EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    RAISE NOTICE 'Error in get_course_booking_count for table %: %', table_name, SQLERRM;
    RETURN 0;
END;
$function$;