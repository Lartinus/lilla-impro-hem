-- Fix debug function with proper variable naming
CREATE OR REPLACE FUNCTION public.debug_delete_participant(p_table_name text, p_participant_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  calling_user_id UUID;
  user_has_admin_role BOOLEAN;
  table_exists_check BOOLEAN;
  found_records INTEGER;
  delete_result INTEGER;
  debug_info jsonb;
BEGIN
  -- Get the calling user ID
  calling_user_id := auth.uid();
  
  -- Check admin role
  user_has_admin_role := public.has_role(calling_user_id, 'admin');
  
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table_name
  ) INTO table_exists_check;
  
  -- Count matching records before deletion
  EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE lower(email) = $1', p_table_name) 
  INTO found_records USING lower(p_participant_email);
  
  -- Attempt delete
  IF user_has_admin_role AND table_exists_check THEN
    PERFORM set_config('role', 'service_role', true);
    EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', p_table_name) 
    USING lower(p_participant_email);
    GET DIAGNOSTICS delete_result = ROW_COUNT;
  ELSE
    delete_result := -1;
  END IF;
  
  -- Build debug response
  debug_info := jsonb_build_object(
    'calling_user_id', calling_user_id,
    'user_has_admin_role', user_has_admin_role,
    'table_exists', table_exists_check,
    'found_records_before_delete', found_records,
    'delete_result', delete_result,
    'search_email', lower(p_participant_email)
  );
  
  RETURN debug_info;
END;
$function$;