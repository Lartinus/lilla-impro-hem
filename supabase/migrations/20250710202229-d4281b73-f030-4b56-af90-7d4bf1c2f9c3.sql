-- Add debug logging to understand why deletion is failing
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rows_affected INTEGER;
  table_exists BOOLEAN;
  email_found BOOLEAN;
BEGIN
  -- Log the inputs
  RAISE NOTICE 'DEBUG: table_name = %, participant_email = %', table_name, participant_email;
  
  -- Check if table exists first
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) INTO table_exists;
  
  RAISE NOTICE 'DEBUG: table_exists = %', table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE 'DEBUG: Table does not exist';
    RETURN FALSE;
  END IF;
  
  -- Check if email exists before deletion
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.%I WHERE email = $1)', table_name) 
  INTO email_found USING participant_email;
  
  RAISE NOTICE 'DEBUG: email_found (exact match) = %', email_found;
  
  -- If exact match not found, try case insensitive
  IF NOT email_found THEN
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.%I WHERE lower(email) = lower($1))', table_name) 
    INTO email_found USING participant_email;
    
    RAISE NOTICE 'DEBUG: email_found (case insensitive) = %', email_found;
  END IF;
  
  -- Delete the participant directly (bypassing RLS) - try exact match first
  EXECUTE format('DELETE FROM public.%I WHERE email = $1', table_name) 
  USING participant_email;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RAISE NOTICE 'DEBUG: rows_affected (exact match) = %', rows_affected;
  
  -- If no rows affected, try with lowercase comparison
  IF rows_affected = 0 THEN
    EXECUTE format('DELETE FROM public.%I WHERE lower(email) = lower($1)', table_name) 
    USING participant_email;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RAISE NOTICE 'DEBUG: rows_affected (case insensitive) = %', rows_affected;
  END IF;
  
  RAISE NOTICE 'DEBUG: Final result = %', rows_affected > 0;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'DEBUG: Exception occurred: %', SQLERRM;
    RETURN FALSE;
END;
$function$;