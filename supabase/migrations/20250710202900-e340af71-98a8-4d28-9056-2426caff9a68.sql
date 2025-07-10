-- Create a completely new approach using raw deletion
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  delete_query TEXT;
  result BOOLEAN := false;
BEGIN
  RAISE NOTICE 'ADMIN DELETE: Starting deletion for % from %', participant_email, table_name;
  
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RAISE NOTICE 'ADMIN DELETE: Table % does not exist', table_name;
    RETURN FALSE;
  END IF;
  
  -- Construct and execute the delete query directly
  delete_query := format('DELETE FROM public.%I WHERE email = %L RETURNING true', table_name, participant_email);
  
  RAISE NOTICE 'ADMIN DELETE: Executing query: %', delete_query;
  
  BEGIN
    EXECUTE delete_query INTO result;
    IF result IS NOT NULL THEN
      RAISE NOTICE 'ADMIN DELETE: Successfully deleted participant';
      RETURN true;
    END IF;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE NOTICE 'ADMIN DELETE: No exact match found, trying case insensitive';
  END;
  
  -- If exact match didn't work, try case insensitive
  delete_query := format('DELETE FROM public.%I WHERE lower(email) = lower(%L) RETURNING true', table_name, participant_email);
  
  RAISE NOTICE 'ADMIN DELETE: Executing case insensitive query: %', delete_query;
  
  BEGIN
    EXECUTE delete_query INTO result;
    IF result IS NOT NULL THEN
      RAISE NOTICE 'ADMIN DELETE: Successfully deleted participant (case insensitive)';
      RETURN true;
    END IF;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE NOTICE 'ADMIN DELETE: No match found even with case insensitive search';
  END;
  
  RAISE NOTICE 'ADMIN DELETE: Failed to delete participant';
  RETURN false;
END;
$function$;