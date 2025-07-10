-- Add DELETE and UPDATE policies for other existing course tables
CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_delete" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_update" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course_niv_2_l_ngform_improviserad_komik_1749806847850_admin_delete" 
ON public.course_niv_2_l_ngform_improviserad_komik_1749806847850 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "course_niv_2_l_ngform_improviserad_komik_1749806847850_admin_update" 
ON public.course_niv_2_l_ngform_improviserad_komik_1749806847850 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Update the create_course_booking_table function to include DELETE and UPDATE policies
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