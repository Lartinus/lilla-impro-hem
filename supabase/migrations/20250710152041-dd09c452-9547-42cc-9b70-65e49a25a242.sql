-- Create a simple test function that directly deletes from the specific table
CREATE OR REPLACE FUNCTION public.test_delete_participant(participant_email text)
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
  
  -- Direct delete without dynamic SQL
  DELETE FROM public.course_niv__1_1752147042033 
  WHERE lower(email) = lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RAISE NOTICE 'Direct delete affected % rows', rows_affected;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in test_delete_participant: %', SQLERRM;
    RETURN FALSE;
END;
$function$;