-- Create show templates table
CREATE TABLE public.show_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  regular_price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER NOT NULL DEFAULT 0,
  max_tickets INTEGER DEFAULT 100,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.show_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for show_templates
CREATE POLICY "Admins can manage show templates" 
ON public.show_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_show_templates_updated_at
BEFORE UPDATE ON public.show_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_show_templates_active ON public.show_templates(is_active);
CREATE INDEX idx_show_templates_sort ON public.show_templates(sort_order);