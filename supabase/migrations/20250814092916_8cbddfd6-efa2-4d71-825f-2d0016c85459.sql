-- Fix multiple permissive policies issues
-- Consolidate overlapping policies into single comprehensive policies

-- Fix course_templates: drop the redundant public_insert policy
DROP POLICY IF EXISTS "public_insert" ON public.course_templates;

-- Fix user_roles: consolidate the two SELECT policies into one
DROP POLICY IF EXISTS "Role management permissions" ON public.user_roles;
DROP POLICY IF EXISTS "View user roles" ON public.user_roles;

-- Create a single comprehensive policy for user_roles SELECT
CREATE POLICY "User roles access" 
ON public.user_roles 
FOR SELECT 
USING (
  -- Users can view their own roles
  ((SELECT auth.uid()) = user_id) 
  OR 
  -- Admins can view all roles (covers the management permissions aspect)
  has_role((SELECT auth.uid()), 'admin'::app_role)
);

-- Recreate the management policy for non-SELECT operations (UPDATE, INSERT, DELETE)
CREATE POLICY "Role management permissions" 
ON public.user_roles 
FOR ALL 
USING (
  has_role((SELECT auth.uid()), 'superadmin'::app_role) 
  OR (
    has_role((SELECT auth.uid()), 'admin'::app_role) 
    AND (role <> 'superadmin'::app_role) 
    AND (NOT ((role = 'admin'::app_role) AND (user_id = (SELECT auth.uid()))))
  )
)
WITH CHECK (
  has_role((SELECT auth.uid()), 'superadmin'::app_role) 
  OR (
    has_role((SELECT auth.uid()), 'admin'::app_role) 
    AND (role <> 'superadmin'::app_role) 
    AND (NOT ((role = 'admin'::app_role) AND (user_id = (SELECT auth.uid()))))
  )
);