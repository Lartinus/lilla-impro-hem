-- Create a function that works correctly with RLS by using the admin context properly
-- This approach uses a function that will have the correct permissions
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  booking_count INTEGER := 0;
  sql_query TEXT;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Create the SQL query using proper identifier quoting
  sql_query := 'SELECT COUNT(*) FROM public.' || quote_ident(table_name);
  
  -- Execute the query - this should work because SECURITY DEFINER runs as function owner
  EXECUTE sql_query INTO booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- Return 0 if any error occurs
    RETURN 0;
END;
$function$;

-- Make sure the function has the right permissions
REVOKE ALL ON FUNCTION public.get_course_booking_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO authenticated;