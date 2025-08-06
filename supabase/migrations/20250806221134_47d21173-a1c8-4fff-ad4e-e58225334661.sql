-- Add resend tracking columns to course participant tables
-- This is a template that will be applied to existing course tables via triggers

-- First, let's create a function to add resend tracking columns to course tables
CREATE OR REPLACE FUNCTION add_resend_tracking_to_course_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if table exists first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND information_schema.tables.table_name = add_resend_tracking_to_course_table.table_name
  ) THEN
    RETURN;
  END IF;
  
  -- Add resend_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = add_resend_tracking_to_course_table.table_name 
    AND column_name = 'resend_count'
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN resend_count INTEGER DEFAULT 0', add_resend_tracking_to_course_table.table_name);
  END IF;
  
  -- Add last_resent_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = add_resend_tracking_to_course_table.table_name 
    AND column_name = 'last_resent_at'
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN last_resent_at TIMESTAMP WITH TIME ZONE', add_resend_tracking_to_course_table.table_name);
  END IF;
END;
$$;

-- Apply to existing course tables
DO $$
DECLARE
    course_table RECORD;
BEGIN
    FOR course_table IN 
        SELECT table_name FROM public.course_instances WHERE is_active = true
    LOOP
        BEGIN
            PERFORM add_resend_tracking_to_course_table(course_table.table_name);
        EXCEPTION 
            WHEN OTHERS THEN
                -- Continue if table doesn't exist or other error
                CONTINUE;
        END;
    END LOOP;
END;
$$;

-- Update the course table creation function to include resend tracking
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
      email TEXT NOT NULL CHECK (public.is_valid_email(email)),
      address TEXT,
      postal_code TEXT,
      city TEXT,
      message TEXT,
      resend_count INTEGER DEFAULT 0,
      last_resent_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT %I_unique_email UNIQUE (email)
    )', table_name, table_name);
  
  -- Enable RLS on the new table
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Add policies (public can insert, admins can view/modify/delete)
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR INSERT 
    WITH CHECK (true)', table_name || '_public_insert', table_name);
    
  -- Add admin read policy
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR SELECT 
    USING (public.has_role(auth.uid(), ''admin''))', table_name || '_admin_read', table_name);
    
  -- Add admin update policy
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR UPDATE 
    USING (public.has_role(auth.uid(), ''admin''))', table_name || '_admin_update', table_name);
    
  -- Add admin delete policy
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR DELETE 
    USING (public.has_role(auth.uid(), ''admin''))', table_name || '_admin_delete', table_name);
    
  -- Add validation trigger
  EXECUTE format('
    CREATE TRIGGER validate_booking_trigger
    BEFORE INSERT OR UPDATE ON public.%I
    FOR EACH ROW EXECUTE FUNCTION public.validate_course_booking()', table_name);
END;
$function$;