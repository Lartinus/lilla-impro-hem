-- Create a more secure version of the RPC function that bypasses RLS for counting
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  booking_count INTEGER := 0;
  query_text TEXT;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Build the query text and temporarily disable RLS for this function
  query_text := format('SELECT COUNT(*)::integer FROM public.%I', table_name);
  
  -- Temporarily disable RLS to get the count
  SET LOCAL row_security = off;
  
  -- Execute the query
  EXECUTE query_text INTO booking_count;
  
  -- Reset row security
  SET LOCAL row_security = on;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    -- Reset row security in case of error
    SET LOCAL row_security = on;
    RETURN 0;
END;
$function$;