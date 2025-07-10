-- Fix the delete_course_participant function to properly handle email comparison
CREATE OR REPLACE FUNCTION public.delete_course_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the participant (compare both emails as lowercase)
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', table_name) 
  USING lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;