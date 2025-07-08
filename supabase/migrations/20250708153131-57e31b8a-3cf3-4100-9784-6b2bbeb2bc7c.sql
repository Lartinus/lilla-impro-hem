-- Fix the function to work correctly with admin access
-- The issue is that the function should work when called from admin interface
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  booking_count INTEGER := 0;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user has admin role when authenticated
  IF current_user_id IS NOT NULL AND NOT public.has_role(current_user_id, 'admin') THEN
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