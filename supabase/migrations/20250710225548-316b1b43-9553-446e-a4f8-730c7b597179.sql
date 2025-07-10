-- Update function to bypass RLS when fetching course participants 
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
  
  -- Set local role to bypass RLS for this operation
  PERFORM set_config('role', 'service_role', true);
  
  -- Return the email and name from the specified table using dynamic SQL
  RETURN QUERY EXECUTE format('SELECT email, name FROM public.%I ORDER BY created_at', table_name);
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN;
END;
$function$