
-- Create a table for storing inquiries from corporate and private forms
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('corporate', 'private')),
  name TEXT NOT NULL CHECK (trim(name) != ''),
  email TEXT NOT NULL CHECK (public.is_valid_email(email)),
  phone TEXT,
  company TEXT, -- Only for corporate inquiries
  occasion TEXT,
  requirements TEXT NOT NULL CHECK (trim(requirements) != ''),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the inquiries table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy that allows public to insert inquiries
CREATE POLICY "Public can insert inquiries" 
ON public.inquiries 
FOR INSERT 
WITH CHECK (true);

-- Create policy that allows admins to view all inquiries
CREATE POLICY "Admins can view all inquiries" 
ON public.inquiries 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy that allows admins to update inquiries (for marking as handled)
CREATE POLICY "Admins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));
