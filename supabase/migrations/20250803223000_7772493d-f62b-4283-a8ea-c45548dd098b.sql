-- Fix the generate_offer_token function to use a different approach
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
    -- Generate 32-character secure token using md5 and random()
    token := upper(substring(md5(random()::text || clock_timestamp()::text || random()::text) from 1 for 32));
    
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