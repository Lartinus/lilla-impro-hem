-- Fix security issue: Set fixed search_path for admin_delete_participant function
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Check if table exists first  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = admin_delete_participant.table_name
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Simple delete with exact email match
  EXECUTE format('DELETE FROM public.%I WHERE email = $1', admin_delete_participant.table_name) 
  USING participant_email;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;