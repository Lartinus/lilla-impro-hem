
-- Phase 1: Remove duplicate policies and clean up
-- First, drop all duplicate policies to start fresh

-- Drop duplicate policies on course_bookings
DROP POLICY IF EXISTS "Admin and staff can view all bookings" ON public.course_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.course_bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.course_bookings;
DROP POLICY IF EXISTS "Anonymous users can create bookings" ON public.course_bookings;

-- Keep only the essential policies for course_bookings
-- CREATE POLICY "Users can insert course bookings" ON public.course_bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Admins can view all course bookings" ON public.course_bookings FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Phase 2: Optimize the has_role function for better performance
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Phase 3: Add data validation constraints to course booking tables
-- Add email validation function
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
$function$;

-- Add phone validation function  
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT length(trim(phone)) >= 6 AND phone ~ '^[+0-9\s\-()]+$'
$function$;

-- Add validation triggers for existing course tables
CREATE OR REPLACE FUNCTION public.validate_course_booking()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate email format
  IF NOT public.is_valid_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate phone number
  IF NOT public.is_valid_phone(NEW.phone) THEN
    RAISE EXCEPTION 'Invalid phone number format: %', NEW.phone;
  END IF;
  
  -- Validate name is not empty
  IF trim(NEW.name) = '' OR NEW.name IS NULL THEN
    RAISE EXCEPTION 'Name cannot be empty';
  END IF;
  
  -- Normalize email to lowercase
  NEW.email := lower(trim(NEW.email));
  NEW.name := trim(NEW.name);
  NEW.phone := trim(NEW.phone);
  
  RETURN NEW;
END;
$function$;

-- Apply validation triggers to existing course tables
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'course_%'
        AND tablename != 'course_bookings'
        AND tablename != 'course_instances'
    LOOP
        -- Drop existing trigger if it exists
        EXECUTE format('DROP TRIGGER IF EXISTS validate_booking_trigger ON public.%I', table_record.tablename);
        
        -- Create validation trigger
        EXECUTE format('
            CREATE TRIGGER validate_booking_trigger
            BEFORE INSERT OR UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.validate_course_booking()', 
            table_record.tablename);
    END LOOP;
END $$;

-- Phase 4: Update the create_course_booking_table function with all constraints
CREATE OR REPLACE FUNCTION public.create_course_booking_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS public.%I (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL CHECK (trim(name) != ''''),
      phone TEXT NOT NULL CHECK (length(trim(phone)) >= 6),
      email TEXT NOT NULL CHECK (email ~* ''^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$''),
      address TEXT,
      postal_code TEXT,
      city TEXT,
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT %I_unique_email UNIQUE (email)
    )', table_name, table_name);
  
  -- Enable RLS on the new table
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Add policies (public can insert, admins can view/modify)
  EXECUTE format('
    CREATE POLICY "%I_public_insert" 
    ON public.%I 
    FOR INSERT 
    WITH CHECK (true)', table_name, table_name);
    
  -- Add admin read policy
  EXECUTE format('
    CREATE POLICY "%I_admin_read" 
    ON public.%I 
    FOR SELECT 
    USING (public.has_role(auth.uid(), ''admin''))', table_name, table_name);
    
  -- Add validation trigger
  EXECUTE format('
    CREATE TRIGGER validate_booking_trigger
    BEFORE INSERT OR UPDATE ON public.%I
    FOR EACH ROW EXECUTE FUNCTION public.validate_course_booking()', table_name);
END;
$function$;

-- Phase 5: Clean up course_bookings table policies to be consistent
-- Ensure course_bookings has the same validation
DROP TRIGGER IF EXISTS validate_booking_trigger ON public.course_bookings;
CREATE TRIGGER validate_booking_trigger
BEFORE INSERT OR UPDATE ON public.course_bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_course_booking();

-- Add missing constraints to course_bookings if they don't exist
DO $$
BEGIN
    -- Add email format constraint
    BEGIN
        ALTER TABLE public.course_bookings ADD CONSTRAINT course_bookings_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add phone length constraint
    BEGIN
        ALTER TABLE public.course_bookings ADD CONSTRAINT course_bookings_phone_length 
        CHECK (length(trim(phone)) >= 6);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add name not empty constraint
    BEGIN
        ALTER TABLE public.course_bookings ADD CONSTRAINT course_bookings_name_not_empty 
        CHECK (trim(name) != '');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
