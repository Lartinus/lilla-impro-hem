-- Fix the add_course_participant function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.add_course_participant(
  table_name text,
  participant_name text,
  participant_email text,
  participant_phone text DEFAULT ''::text,
  participant_address text DEFAULT ''::text,
  participant_postal_code text DEFAULT ''::text,
  participant_city text DEFAULT ''::text,
  participant_message text DEFAULT ''::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    WHERE table_schema = 'public' AND information_schema.tables.table_name = add_course_participant.table_name
  ) THEN
    RAISE EXCEPTION 'Course table does not exist';
  END IF;
  
  -- Insert the participant
  EXECUTE format('
    INSERT INTO public.%I (name, email, phone, address, postal_code, city, message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', add_course_participant.table_name) 
  USING participant_name, lower(participant_email), participant_phone, participant_address, participant_postal_code, participant_city, participant_message;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add participant: %', SQLERRM;
END;
$function$;

-- Create new function to move participants between courses
CREATE OR REPLACE FUNCTION public.move_course_participant(
  from_table_name text,
  to_table_name text,
  participant_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  calling_user_id UUID;
  participant_data RECORD;
  rows_affected INTEGER;
BEGIN
  -- Get the calling user ID before any operations
  calling_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.has_role(calling_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Check if both tables exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = from_table_name
  ) THEN
    RAISE EXCEPTION 'Source course table does not exist';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = to_table_name
  ) THEN
    RAISE EXCEPTION 'Target course table does not exist';
  END IF;
  
  -- Get participant data from source table
  EXECUTE format('SELECT name, phone, email, address, postal_code, city, message FROM public.%I WHERE lower(email) = $1', from_table_name) 
  INTO participant_data USING lower(participant_email);
  
  IF participant_data IS NULL THEN
    RAISE EXCEPTION 'Participant not found in source course';
  END IF;
  
  -- Insert into target table
  EXECUTE format('
    INSERT INTO public.%I (name, email, phone, address, postal_code, city, message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ', to_table_name) 
  USING participant_data.name, participant_data.email, participant_data.phone, 
        participant_data.address, participant_data.postal_code, participant_data.city, participant_data.message;
  
  -- Remove from source table
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', from_table_name) 
  USING lower(participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  IF rows_affected = 0 THEN
    RAISE EXCEPTION 'Failed to remove participant from source course';
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to move participant: %', SQLERRM;
END;
$function$;