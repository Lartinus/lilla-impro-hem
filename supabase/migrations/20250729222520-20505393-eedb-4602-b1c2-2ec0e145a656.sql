-- Create show_tags table for managing different types of shows
CREATE TABLE public.show_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#666666',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on show_tags
ALTER TABLE public.show_tags ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active tags
CREATE POLICY "Anyone can view active show tags"
ON public.show_tags
FOR SELECT
USING (is_active = true);

-- Allow admins to manage tags
CREATE POLICY "Admins can manage show tags"
ON public.show_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add tag_id column to admin_shows table
ALTER TABLE public.admin_shows 
ADD COLUMN tag_id UUID REFERENCES public.show_tags(id);

-- Create trigger for updated_at on show_tags
CREATE TRIGGER update_show_tags_updated_at
BEFORE UPDATE ON public.show_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial tag data
INSERT INTO public.show_tags (name, description, color, sort_order) VALUES
('Ensemble', 'Föreställningar med vår professionella ensemble', '#2563eb', 1),
('House Teams', 'Föreställningar med våra avancerade kursare', '#dc2626', 2),
('Kursuppspel', 'Uppspel från våra baskurser', '#16a34a', 3),
('Gästspel', 'Föreställningar med inbjudna grupper', '#7c3aed', 4);