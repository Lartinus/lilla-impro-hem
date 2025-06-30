
-- Create RLS policies with IF NOT EXISTS logic using DO blocks

DO $$
BEGIN
    -- Create policy for course_instances if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'course_instances' 
        AND policyname = 'Public can view active course instances'
    ) THEN
        CREATE POLICY "Public can view active course instances" 
        ON public.course_instances 
        FOR SELECT 
        USING (is_active = true);
    END IF;

    -- Create admin policy for course_instances if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'course_instances' 
        AND policyname = 'Admins can manage all course instances'
    ) THEN
        CREATE POLICY "Admins can manage all course instances" 
        ON public.course_instances 
        FOR ALL 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- Create insert policy for course_bookings if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'course_bookings' 
        AND policyname = 'Users can insert course bookings'
    ) THEN
        CREATE POLICY "Users can insert course bookings" 
        ON public.course_bookings 
        FOR INSERT 
        WITH CHECK (true);
    END IF;

    -- Create admin read policy for course_bookings if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'course_bookings' 
        AND policyname = 'Admins can view all course bookings'
    ) THEN
        CREATE POLICY "Admins can view all course bookings" 
        ON public.course_bookings 
        FOR SELECT 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- Create user role policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Users can view their own roles'
    ) THEN
        CREATE POLICY "Users can view their own roles" 
        ON public.user_roles 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Admins can manage all user roles'
    ) THEN
        CREATE POLICY "Admins can manage all user roles" 
        ON public.user_roles 
        FOR ALL 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Update create_course_booking_table function to add proper admin policy
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
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
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
END;
$function$;

-- Add authorization checks to sensitive functions
CREATE OR REPLACE FUNCTION public.drop_course_booking_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', table_name);
END;
$function$;

-- Update existing course booking tables to have admin read policy
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
        -- Check if policy already exists before creating
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_record.tablename 
            AND policyname = table_record.tablename || '_admin_read'
        ) THEN
            EXECUTE format('
                CREATE POLICY "%I_admin_read" 
                ON public.%I 
                FOR SELECT 
                USING (public.has_role(auth.uid(), ''admin''))', 
                table_record.tablename, table_record.tablename);
        END IF;
    END LOOP;
END $$;
