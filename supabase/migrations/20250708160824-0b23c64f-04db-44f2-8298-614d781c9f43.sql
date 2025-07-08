-- Update the get_course_participants function to handle RLS properly
CREATE OR REPLACE FUNCTION public.get_course_participants(table_name text)
RETURNS TABLE(email text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) THEN
    RETURN;
  END IF;
  
  -- Use specific table queries to avoid RLS issues
  IF table_name = 'course_niv_1_scenarbete_improv_comedy_1749454350362' THEN
    RETURN QUERY 
    SELECT c.email, c.name 
    FROM course_niv_1_scenarbete_improv_comedy_1749454350362 c
    ORDER BY c.created_at;
  ELSIF table_name = 'course_niv_2_l_ngform_improviserad_komik_1749806847850' THEN
    RETURN QUERY 
    SELECT c.email, c.name 
    FROM course_niv_2_l_ngform_improviserad_komik_1749806847850 c
    ORDER BY c.created_at;
  END IF;
  
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN;
END;
$function$;