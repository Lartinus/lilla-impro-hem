-- Update function to properly bypass RLS using direct table access
CREATE OR REPLACE FUNCTION public.get_course_participants(table_name text)
RETURNS TABLE(email text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  -- SECURITY DEFINER allows this function to access tables as the function owner
  RETURN QUERY EXECUTE format('SELECT email, name FROM %I ORDER BY created_at', table_name);
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN;
END;
$function$