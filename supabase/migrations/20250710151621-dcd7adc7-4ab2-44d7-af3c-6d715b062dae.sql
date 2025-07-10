-- Test the exact DELETE operation and add logging to the function
CREATE OR REPLACE FUNCTION public.delete_course_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
  debug_count INTEGER;
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
    RAISE NOTICE 'Table does not exist: %', table_name;
    RETURN FALSE;
  END IF;
  
  -- Log what we're trying to delete
  EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE lower(email) = $1', table_name) 
  INTO debug_count USING lower(participant_email);
  
  RAISE NOTICE 'Found % records to delete for email: %', debug_count, participant_email;
  
  -- Delete the participant (compare both emails as lowercase)
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', table_name) 
  USING lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % rows', rows_affected;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in delete_course_participant: %', SQLERRM;
    RETURN FALSE;
END;
$function$;