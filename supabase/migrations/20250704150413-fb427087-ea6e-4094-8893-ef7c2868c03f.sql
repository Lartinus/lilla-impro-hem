-- Create actors table for show performers (separate from course leaders)
CREATE TABLE public.actors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;

-- Create policies for actors
CREATE POLICY "Anyone can view active actors" 
ON public.actors 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage actors" 
ON public.actors 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_actors_updated_at
BEFORE UPDATE ON public.actors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update show_performers to reference actors instead of performers
ALTER TABLE public.show_performers 
DROP CONSTRAINT show_performers_performer_id_fkey;

ALTER TABLE public.show_performers 
RENAME COLUMN performer_id TO actor_id;

ALTER TABLE public.show_performers 
ADD CONSTRAINT show_performers_actor_id_fkey 
FOREIGN KEY (actor_id) REFERENCES public.actors(id) ON DELETE CASCADE;

-- Add index
CREATE INDEX idx_actors_active ON public.actors(is_active);