-- Fix the remaining multiple permissive policies issue on user_roles
-- The problem is that "Role management permissions" is FOR ALL (includes SELECT)
-- and "User roles access" is FOR SELECT, creating duplicate SELECT policies

-- Drop the current "Role management permissions" policy
DROP POLICY IF EXISTS "Role management permissions" ON public.user_roles;

-- Create separate policies for INSERT, UPDATE, DELETE operations
CREATE POLICY "Role management insert" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  has_role((SELECT auth.uid()), 'superadmin'::app_role) 
  OR (
    has_role((SELECT auth.uid()), 'admin'::app_role) 
    AND (role <> 'superadmin'::app_role)
  )
);

CREATE POLICY "Role management update" 
ON public.user_roles 
FOR UPDATE 
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
  )
);

CREATE POLICY "Role management delete" 
ON public.user_roles 
FOR DELETE 
USING (
  has_role((SELECT auth.uid()), 'superadmin'::app_role) 
  OR (
    has_role((SELECT auth.uid()), 'admin'::app_role) 
    AND (role <> 'superadmin'::app_role) 
    AND (NOT ((role = 'admin'::app_role) AND (user_id = (SELECT auth.uid()))))
  )
);