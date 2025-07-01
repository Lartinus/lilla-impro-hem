
-- Fix Function Search Path Mutable warnings for security functions

-- Update is_valid_email function with secure search_path
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
  SELECT email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
$function$;

-- Update is_valid_phone function with secure search_path
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
  SELECT length(trim(phone)) >= 6 
    AND length(trim(phone)) <= 20 
    AND phone ~ '^[+0-9\s\-()]+$'
$function$;

-- Update validate_course_booking function with secure search_path
CREATE OR REPLACE FUNCTION public.validate_course_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
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
$function$;
