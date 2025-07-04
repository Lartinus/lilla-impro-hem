-- Create shows table for admin-managed performances
CREATE TABLE public.admin_shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  venue TEXT NOT NULL,
  venue_address TEXT,
  venue_maps_url TEXT,
  description TEXT,
  regular_price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER NOT NULL DEFAULT 0,
  max_tickets INTEGER DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discount codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_amount INTEGER NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create show performers junction table
CREATE TABLE public.show_performers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.admin_shows(id) ON DELETE CASCADE,
  performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(show_id, performer_id)
);

-- Enable RLS
ALTER TABLE public.admin_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_performers ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_shows
CREATE POLICY "Anyone can view active shows" 
ON public.admin_shows 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage shows" 
ON public.admin_shows 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create policies for discount_codes  
CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create policies for show_performers
CREATE POLICY "Anyone can view show performers" 
ON public.show_performers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage show performers" 
ON public.show_performers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_admin_shows_updated_at
BEFORE UPDATE ON public.admin_shows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_admin_shows_slug ON public.admin_shows(slug);
CREATE INDEX idx_admin_shows_date ON public.admin_shows(show_date);
CREATE INDEX idx_admin_shows_active ON public.admin_shows(is_active);
CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_show_performers_show_id ON public.show_performers(show_id);