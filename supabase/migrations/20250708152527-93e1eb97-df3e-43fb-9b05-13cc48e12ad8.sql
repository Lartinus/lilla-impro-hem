-- Fix the get_course_booking_count function
-- The issue is likely with parameter binding in the dynamic SQL
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  booking_count INTEGER;
  sql_query TEXT;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Build the SQL query
  sql_query := format('SELECT COUNT(*) FROM public.%I', table_name);
  
  -- Execute the query
  EXECUTE sql_query INTO booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE WARNING 'Error in get_course_booking_count for table %: %', table_name, SQLERRM;
    RETURN 0;
END;
$function$;