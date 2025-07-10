-- Update function to safely get course participants from dynamic tables using proper dynamic SQL
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
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN;
  END IF;
  
  -- Return the email and name from the specified table using dynamic SQL
  RETURN QUERY EXECUTE format('SELECT email, name FROM public.%I ORDER BY created_at', table_name);
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN;
END;
$function$