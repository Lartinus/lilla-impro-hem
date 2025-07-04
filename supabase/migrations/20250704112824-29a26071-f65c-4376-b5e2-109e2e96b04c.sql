-- Fix Auth RLS Initialization Plan warnings by optimizing auth.uid() calls
-- Replace auth.uid() with (select auth.uid()) for better performance

-- Update user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
-- Consolidate into single admin policy to fix multiple permissive policies warning
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role((select auth.uid()), 'admin'));

-- Update course_instances policies
DROP POLICY IF EXISTS "Admins can manage all course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Public can create course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Public can view active course instances" ON public.course_instances;

-- Create optimized policies for course_instances
CREATE POLICY "Public can view active course instances" 
ON public.course_instances 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can create course instances" 
ON public.course_instances 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all course instances" 
ON public.course_instances 
FOR ALL 
USING (public.has_role((select auth.uid()), 'admin'));

-- Update course_bookings policy
DROP POLICY IF EXISTS "Admins can view all course bookings" ON public.course_bookings;
CREATE POLICY "Admins can view all course bookings" 
ON public.course_bookings 
FOR SELECT 
USING (public.has_role((select auth.uid()), 'admin'));

-- Update ticket_purchases policy
DROP POLICY IF EXISTS "Admins can view all ticket purchases" ON public.ticket_purchases;
CREATE POLICY "Admins can view all ticket purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (public.has_role((select auth.uid()), 'admin'));

-- Update inquiries policies
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries" 
ON public.inquiries 
FOR SELECT 
USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
USING (public.has_role((select auth.uid()), 'admin'));

-- Fix ticket_bookings multiple permissive policies
DROP POLICY IF EXISTS "Can manage bookings" ON public.ticket_bookings;
DROP POLICY IF EXISTS "Public can insert ticket bookings" ON public.ticket_bookings;
DROP POLICY IF EXISTS "Public can view own bookings" ON public.ticket_bookings;

-- Create single comprehensive policy for ticket_bookings
CREATE POLICY "Public can manage ticket bookings" 
ON public.ticket_bookings 
FOR ALL 
USING (true);

-- Update all course table policies to use optimized auth.uid()
DO $$
DECLARE
    table_record RECORD;
    policy_name TEXT;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'course_%'
        AND tablename != 'course_bookings'
        AND tablename != 'course_instances'
    LOOP
        -- Drop existing admin read policy
        policy_name := table_record.tablename || '_admin_read';
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_record.tablename);
        
        -- Create optimized admin read policy
        EXECUTE format('
            CREATE POLICY %I 
            ON public.%I 
            FOR SELECT 
            USING (public.has_role((select auth.uid()), ''admin''))', 
            policy_name, table_record.tablename);
    END LOOP;
END $$;