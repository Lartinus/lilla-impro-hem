-- Create a new simplified delete function that bypasses RLS completely
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Log what we're trying to do
  RAISE NOTICE 'Trying to delete email: % from table: %', participant_email, table_name;
  
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RAISE NOTICE 'Table does not exist: %', table_name;
    RETURN FALSE;
  END IF;
  
  -- Set role to service_role to bypass RLS
  PERFORM set_config('role', 'service_role', true);
  
  -- Delete the participant - try exact match first
  EXECUTE format('DELETE FROM public.%I WHERE email = $1', table_name) 
  USING participant_email;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RAISE NOTICE 'Rows affected with exact match: %', rows_affected;
  
  -- If no rows affected, try with lowercase comparison
  IF rows_affected = 0 THEN
    EXECUTE format('DELETE FROM public.%I WHERE lower(email) = lower($1)', table_name) 
    USING participant_email;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RAISE NOTICE 'Rows affected with case insensitive: %', rows_affected;
  END IF;
  
  RAISE NOTICE 'Final result: %', rows_affected > 0;
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Exception: %', SQLERRM;
    RETURN FALSE;
END;
$function$;