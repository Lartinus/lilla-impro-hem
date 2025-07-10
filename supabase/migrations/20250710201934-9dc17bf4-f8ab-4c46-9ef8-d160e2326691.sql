-- Fix the admin_delete_participant function to handle email matching properly
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the participant directly (bypassing RLS) - try exact match first
  EXECUTE format('DELETE FROM public.%I WHERE email = $1', table_name) 
  USING participant_email;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- If no rows affected, try with lowercase comparison
  IF rows_affected = 0 THEN
    EXECUTE format('DELETE FROM public.%I WHERE lower(email) = lower($1)', table_name) 
    USING participant_email;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
  END IF;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;