-- Fix delete function to properly bypass RLS
CREATE OR REPLACE FUNCTION public.delete_course_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rows_affected INTEGER;
  calling_user_id UUID;
  sql_command TEXT;
BEGIN
  -- Get the calling user ID before any operations
  calling_user_id := auth.uid();
  
  -- Check if user is admin using the captured user ID
  IF NOT public.has_role(calling_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Set local role to bypass RLS
  PERFORM set_config('role', 'service_role', true);
  
  -- Delete the participant
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', table_name) 
  USING lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in delete_course_participant: %', SQLERRM;
    RETURN FALSE;
END;
$function$;