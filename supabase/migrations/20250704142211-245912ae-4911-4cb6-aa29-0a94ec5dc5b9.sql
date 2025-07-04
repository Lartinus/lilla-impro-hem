-- Create interest_signups table for upcoming courses
CREATE TABLE public.interest_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  information TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interest_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for interest signups
CREATE POLICY "Anyone can view visible interest signups" 
ON public.interest_signups 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage interest signups" 
ON public.interest_signups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create table for interest signup submissions
CREATE TABLE public.interest_signup_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interest_signup_id UUID NOT NULL REFERENCES public.interest_signups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on submissions
ALTER TABLE public.interest_signup_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for submissions
CREATE POLICY "Anyone can submit interest signups" 
ON public.interest_signup_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all interest signup submissions" 
ON public.interest_signup_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_interest_signups_updated_at
BEFORE UPDATE ON public.interest_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();