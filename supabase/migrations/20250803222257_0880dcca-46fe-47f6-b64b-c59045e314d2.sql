-- Create course offers table to track waitlist offers
CREATE TABLE public.course_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_instance_id UUID NOT NULL,
  course_title TEXT NOT NULL,
  course_table_name TEXT NOT NULL,
  course_price INTEGER NOT NULL,
  waitlist_email TEXT NOT NULL,
  waitlist_name TEXT NOT NULL,
  waitlist_phone TEXT,
  waitlist_message TEXT,
  offer_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, paid, expired, cancelled
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  stripe_session_id TEXT
);

-- Enable RLS
ALTER TABLE public.course_offers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all course offers" 
ON public.course_offers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view valid offers by token" 
ON public.course_offers 
FOR SELECT 
USING (status = 'sent' AND expires_at > now());

CREATE POLICY "Public can update offer status" 
ON public.course_offers 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can create course offers" 
ON public.course_offers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_course_offers_updated_at
BEFORE UPDATE ON public.course_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique offer token
CREATE OR REPLACE FUNCTION public.generate_offer_token()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  token TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 32-character secure token
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.course_offers WHERE offer_token = token)
    INTO exists_check;
    
    -- If token doesn't exist, break the loop
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN token;
END;
$$;