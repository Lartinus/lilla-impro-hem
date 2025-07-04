-- Fix remaining overlapping SELECT policies by consolidating them

-- Course instances: Remove overlapping SELECT policies and create single comprehensive one
DROP POLICY IF EXISTS "Public can access course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Admins can view all course instances" ON public.course_instances;

CREATE POLICY "View course instances" 
ON public.course_instances 
FOR SELECT 
USING (
  is_active = true OR 
  public.has_role((select auth.uid()), 'admin')
);

-- User roles: Remove overlapping SELECT policies and create single comprehensive one  
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

CREATE POLICY "View user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  (select auth.uid()) = user_id OR 
  public.has_role((select auth.uid()), 'admin')
);