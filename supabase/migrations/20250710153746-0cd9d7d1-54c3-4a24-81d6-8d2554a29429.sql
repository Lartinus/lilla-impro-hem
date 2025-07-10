-- Create admin-specific delete function that bypasses auth checks when called from admin context
CREATE OR REPLACE FUNCTION public.delete_course_participant_admin(p_table_name text, p_participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table_name
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Set local role to bypass RLS for admin operations
  PERFORM set_config('role', 'service_role', true);
  
  -- Delete the participant
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', p_table_name) 
  USING lower(p_participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in delete_course_participant_admin: %', SQLERRM;
    RETURN FALSE;
END;
$function$;