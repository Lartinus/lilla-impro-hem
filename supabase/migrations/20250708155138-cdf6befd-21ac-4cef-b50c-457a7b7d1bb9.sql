-- Fix the RPC function to properly access course booking tables
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
    RAISE NOTICE 'Table % does not exist', table_name;
    RETURN 0;
  END IF;
  
  -- Build the query text
  query_text := format('SELECT COUNT(*)::integer FROM public.%I', table_name);
  RAISE NOTICE 'Executing query: %', query_text;
  
  -- Execute the query with proper error handling
  EXECUTE query_text INTO booking_count;
  
  RAISE NOTICE 'Query result for table %: %', table_name, booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges for table %', table_name;
    RETURN 0;
  WHEN undefined_table THEN
    RAISE NOTICE 'Table % is undefined', table_name;
    RETURN 0;
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_course_booking_count for table %: % (SQLSTATE: %)', table_name, SQLERRM, SQLSTATE;
    RETURN 0;
END;
$function$;