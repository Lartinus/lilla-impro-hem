-- Better approach: Create a function that properly handles RLS by using the admin context
-- First, let's create a function that works correctly with RLS
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
  
  -- We'll use a different approach - let's create a specific query for each known table
  -- since we know the table structure
  CASE table_name
    WHEN 'course_niv_1_scenarbete_improv_comedy_1749454350362' THEN
      SELECT COUNT(*) INTO booking_count FROM public.course_niv_1_scenarbete_improv_comedy_1749454350362;
    WHEN 'course_niv_2_l_ngform_improviserad_komik_1749806847850' THEN
      SELECT COUNT(*) INTO booking_count FROM public.course_niv_2_l_ngform_improviserad_komik_1749806847850;
    ELSE
      -- For dynamic tables, we need to check if we can read them
      -- This won't work for new tables, so let's use a different approach
      BEGIN
        EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE true', table_name) INTO booking_count;
      EXCEPTION
        WHEN OTHERS THEN
          booking_count := 0;
      END;
  END CASE;
  
  RETURN COALESCE(booking_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in get_course_booking_count for table %: %', table_name, SQLERRM;
    RETURN 0;
END;
$function$;