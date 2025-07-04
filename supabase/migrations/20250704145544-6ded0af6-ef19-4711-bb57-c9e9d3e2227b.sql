-- Create venues table for reusable venue management
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  maps_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies for venues
CREATE POLICY "Anyone can view active venues" 
ON public.venues 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage venues" 
ON public.venues 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some default venues
INSERT INTO public.venues (name, address, maps_url, sort_order) VALUES
('Metropole', 'Götgatan 15, Stockholm', 'https://maps.google.com/?q=Metropole+Götgatan+15+Stockholm', 1),
('Studion', 'Teaterstudion, Stockholm', '', 2),
('Externa lokaler', 'Varierar beroende på event', '', 3);

-- Add indexes
CREATE INDEX idx_venues_active ON public.venues(is_active);
CREATE INDEX idx_venues_sort_order ON public.venues(sort_order);