
-- Phase 1: Remove duplicate RLS policy on course_instances
DROP POLICY IF EXISTS "Anyone can view active course instances" ON public.course_instances;

-- Keep only the "Public can view active course instances" policy which is more descriptive

-- Phase 2: Add better constraint validation messages
-- Update validation function to provide more specific error messages
CREATE OR REPLACE FUNCTION public.validate_course_booking()
RETURNS trigger
LANGUAGE plpgsql
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

-- Update phone validation function to include max length
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT length(trim(phone)) >= 6 
    AND length(trim(phone)) <= 20 
    AND phone ~ '^[+0-9\s\-()]+$'
$function$;
