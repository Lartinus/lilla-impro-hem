-- Fix remaining multiple permissive policies warnings
-- Course instances: consolidate overlapping policies
DROP POLICY IF EXISTS "Public can view active course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Public can create course instances" ON public.course_instances;  
DROP POLICY IF EXISTS "Admins can manage all course instances" ON public.course_instances;

-- Create non-overlapping policies for course_instances
CREATE POLICY "Public can access course instances" 
ON public.course_instances 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can create course instances" 
ON public.course_instances 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage course instances" 
ON public.course_instances 
FOR UPDATE 
USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete course instances" 
ON public.course_instances 
FOR DELETE 
USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can view all course instances" 
ON public.course_instances 
FOR SELECT 
USING (public.has_role((select auth.uid()), 'admin'));

-- User roles: fix overlapping SELECT policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create non-overlapping policies for user_roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING ((select auth.uid()) = user_id AND NOT public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role((select auth.uid()), 'admin'));