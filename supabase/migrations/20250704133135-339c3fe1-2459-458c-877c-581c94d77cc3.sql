-- Create performers table for local management
CREATE TABLE public.performers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active performers" 
ON public.performers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage performers" 
ON public.performers 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add subtitle column to course_instances
ALTER TABLE public.course_instances 
ADD COLUMN subtitle TEXT;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_performers_updated_at
BEFORE UPDATE ON public.performers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();