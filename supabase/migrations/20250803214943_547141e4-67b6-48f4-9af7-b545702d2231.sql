-- Create function to remove from waitlist
CREATE OR REPLACE FUNCTION public.remove_from_waitlist(
  course_instance_id_param uuid,
  email_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  removed_position INTEGER;
BEGIN
  -- Get the position of the person being removed
  SELECT position_in_queue INTO removed_position
  FROM public.course_waitlist
  WHERE course_instance_id = course_instance_id_param 
    AND email = lower(trim(email_param));
  
  -- Remove the person
  DELETE FROM public.course_waitlist
  WHERE course_instance_id = course_instance_id_param 
    AND email = lower(trim(email_param));
  
  -- Update positions for people after the removed person
  UPDATE public.course_waitlist
  SET position_in_queue = position_in_queue - 1
  WHERE course_instance_id = course_instance_id_param 
    AND position_in_queue > removed_position;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$