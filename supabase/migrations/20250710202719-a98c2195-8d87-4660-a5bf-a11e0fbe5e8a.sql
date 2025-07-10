-- Create a function that completely bypasses RLS by temporarily disabling it
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rows_affected INTEGER;
  old_setting TEXT;
BEGIN
  RAISE NOTICE 'Starting deletion process for email: % from table: %', participant_email, table_name;
  
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RAISE NOTICE 'Table does not exist: %', table_name;
    RETURN FALSE;
  END IF;
  
  -- Temporarily disable RLS for this session
  old_setting := current_setting('row_security', true);
  PERFORM set_config('row_security', 'off', true);
  
  RAISE NOTICE 'RLS disabled, attempting deletion...';
  
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
  
  -- Restore the old RLS setting
  PERFORM set_config('row_security', coalesce(old_setting, 'on'), true);
  
  RAISE NOTICE 'Final result: %, rows_affected: %', rows_affected > 0, rows_affected;
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    -- Make sure to restore RLS even if there's an exception
    PERFORM set_config('row_security', coalesce(old_setting, 'on'), true);
    RAISE NOTICE 'Exception occurred: %', SQLERRM;
    RETURN FALSE;
END;
$function$;