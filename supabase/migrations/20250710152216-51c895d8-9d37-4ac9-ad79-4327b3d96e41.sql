-- Create a test function without any role checks to isolate the issue
CREATE OR REPLACE FUNCTION public.test_delete_no_auth(participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
  found_count INTEGER;
BEGIN
  -- Check what we're trying to delete first
  SELECT COUNT(*) INTO found_count
  FROM public.course_niv__1_1752147042033
  WHERE lower(email) = lower(participant_email);
  
  RAISE NOTICE 'Found % matching records before delete', found_count;
  
  -- Direct delete without auth check
  DELETE FROM public.course_niv__1_1752147042033 
  WHERE lower(email) = lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RAISE NOTICE 'Delete affected % rows', rows_affected;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RETURN FALSE;
END;
$function$;