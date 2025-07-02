
-- Fix the create_course_booking_table function - use %I for policy names instead of %L
CREATE OR REPLACE FUNCTION public.create_course_booking_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT %I_unique_email UNIQUE (email)
    )', table_name, table_name);
  
  -- Enable RLS on the new table
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Add policies (public can insert, admins can view/modify) - using %I for policy names
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR INSERT 
    WITH CHECK (true)', table_name || '_public_insert', table_name);
    
  -- Add admin read policy - using %I for policy names
  EXECUTE format('
    CREATE POLICY %I 
    ON public.%I 
    FOR SELECT 
    USING (public.has_role(auth.uid(), ''admin''))', table_name || '_admin_read', table_name);
    
  -- Add validation trigger
  EXECUTE format('
    CREATE TRIGGER validate_booking_trigger
    BEFORE INSERT OR UPDATE ON public.%I
    FOR EACH ROW EXECUTE FUNCTION public.validate_course_booking()', table_name);
END;
$$;

-- Now create the missing course table that was failing to create
SELECT public.create_course_booking_table('course_niv_1_scenarbete_improv_comedy_1749454350362');
