-- Drop the problematic function and create a new one
DROP FUNCTION IF EXISTS public.get_course_booking_count(text);

-- Create a new function with proper admin check
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  booking_count INTEGER := 0;
BEGIN
  -- Check if user has admin role - this is critical
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN 0;
  END IF;
  
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) THEN
    RETURN 0;
  END IF;
  
  -- Use dynamic SQL to count rows
  EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO booking_count;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$function$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO authenticated;