-- Update the add_course_participant function to allow empty phone numbers
CREATE OR REPLACE FUNCTION public.add_course_participant(table_name text, participant_name text, participant_email text, participant_phone text DEFAULT ''::text, participant_address text DEFAULT ''::text, participant_postal_code text DEFAULT ''::text, participant_city text DEFAULT ''::text, participant_message text DEFAULT ''::text)
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
  
  -- Set default phone if empty
  IF participant_phone IS NULL OR trim(participant_phone) = '' THEN
    participant_phone := '000000';  -- Default phone number
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
$function$