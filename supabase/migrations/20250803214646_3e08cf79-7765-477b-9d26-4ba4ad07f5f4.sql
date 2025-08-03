-- Create course waitlist table
CREATE TABLE IF NOT EXISTS public.course_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_instance_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (trim(name) != ''),
  email TEXT NOT NULL CHECK (public.is_valid_email(email)),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 6),
  message TEXT,
  position_in_queue INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT course_waitlist_unique_email_course UNIQUE (course_instance_id, email)
);

-- Enable RLS
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can join waitlist" 
ON public.course_waitlist 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage waitlist entries" 
ON public.course_waitlist 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

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