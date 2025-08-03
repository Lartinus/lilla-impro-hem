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