-- Fix Function Search Path Mutable warning
-- Update the update_updated_at_column function to have a secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Also fix any other functions that might have the same issue
CREATE OR REPLACE FUNCTION public.validate_course_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate email format
  IF NOT public.is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Ogiltig e-postadress: %. Ange en giltig e-postadress.', NEW.email;
  END IF;
  
  -- Validate phone number (6-20 characters)
  IF NOT public.is_valid_phone(NEW.phone) OR length(trim(NEW.phone)) > 20 THEN
    RAISE EXCEPTION 'Ogiltigt telefonnummer: %. Telefonnummer måste vara mellan 6-20 tecken.', NEW.phone;
  END IF;
  
  -- Validate name is not empty and reasonable length
  IF trim(NEW.name) = '' OR NEW.name IS NULL THEN
    RAISE EXCEPTION 'Namn får inte vara tomt.';
  END IF;
  
  IF length(trim(NEW.name)) > 100 THEN
    RAISE EXCEPTION 'Namn är för långt. Maximalt 100 tecken tillåtet.';
  END IF;
  
  -- Normalize data
  NEW.email := lower(trim(NEW.email));
  NEW.name := trim(NEW.name);
  NEW.phone := trim(NEW.phone);
  
  -- Trim other text fields
  IF NEW.address IS NOT NULL THEN
    NEW.address := trim(NEW.address);
  END IF;
  
  IF NEW.postal_code IS NOT NULL THEN
    NEW.postal_code := trim(NEW.postal_code);
  END IF;
  
  IF NEW.city IS NOT NULL THEN
    NEW.city := trim(NEW.city);
  END IF;
  
  IF NEW.message IS NOT NULL THEN
    NEW.message := trim(NEW.message);
  END IF;
  
  RETURN NEW;
END;
$$;