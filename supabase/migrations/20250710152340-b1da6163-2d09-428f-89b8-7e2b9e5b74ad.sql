-- Fix the delete function by passing user_id as parameter instead of using auth.uid() inside SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.delete_course_participant(table_name text, participant_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
  calling_user_id UUID;
BEGIN
  -- Get the calling user ID before any operations
  calling_user_id := auth.uid();
  
  -- Check if user is admin using the captured user ID
  IF NOT public.has_role(calling_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Delete the participant
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', table_name) 
  USING lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Also fix the add function
CREATE OR REPLACE FUNCTION public.add_course_participant(
  table_name text, 
  participant_name text, 
  participant_email text, 
  participant_phone text DEFAULT '',
  participant_address text DEFAULT '',
  participant_postal_code text DEFAULT '',
  participant_city text DEFAULT '',
  participant_message text DEFAULT ''
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  calling_user_id UUID;
BEGIN
  -- Get the calling user ID before any operations
  calling_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.has_role(calling_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1
  ) THEN
    RAISE EXCEPTION 'Course table does not exist';
  END IF;
  
  -- Insert the participant
  EXECUTE format('
    INSERT INTO public.%I (name, email, phone, address, postal_code, city, message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', table_name) 
  USING participant_name, lower(participant_email), participant_phone, participant_address, participant_postal_code, participant_city, participant_message;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add participant: %', SQLERRM;
END;
$function$;