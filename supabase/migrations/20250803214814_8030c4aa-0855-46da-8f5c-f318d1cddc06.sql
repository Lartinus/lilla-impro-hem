-- Create function to get waitlist count for a course
CREATE OR REPLACE FUNCTION public.get_waitlist_count(course_instance_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  waitlist_count INTEGER;
BEGIN
  SELECT COUNT(*)::integer
  INTO waitlist_count
  FROM public.course_waitlist
  WHERE course_instance_id = course_instance_id_param;
  
  RETURN COALESCE(waitlist_count, 0);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$function$