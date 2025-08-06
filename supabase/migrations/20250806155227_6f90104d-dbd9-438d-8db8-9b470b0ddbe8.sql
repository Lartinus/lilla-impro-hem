-- Create settings table to store configuration
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins and superadmins can manage settings" 
ON public.settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Insert initial stripe_mode setting (default to test mode)
INSERT INTO public.settings (key, value, description) 
VALUES ('stripe_mode', 'test', 'Stripe payment mode: test or live');

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();