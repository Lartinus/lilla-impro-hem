-- Create function to add someone to waitlist
CREATE OR REPLACE FUNCTION public.add_to_waitlist(
  course_instance_id_param uuid,
  name_param text,
  email_param text,
  phone_param text,
  message_param text DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  next_position INTEGER;
BEGIN
  -- Get the next position in queue
  SELECT COALESCE(MAX(position_in_queue), 0) + 1
  INTO next_position
  FROM public.course_waitlist
  WHERE course_instance_id = course_instance_id_param;
  
  -- Insert the waitlist entry
  INSERT INTO public.course_waitlist (
    course_instance_id,
    name,
    email,
    phone,
    message,
    position_in_queue
  ) VALUES (
    course_instance_id_param,
    trim(name_param),
    lower(trim(email_param)),
    trim(phone_param),
    trim(message_param),
    next_position
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add to waitlist: %', SQLERRM;
END;
$function$