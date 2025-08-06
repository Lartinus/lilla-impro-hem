-- Add superadmin role to the enum
ALTER TYPE public.app_role ADD VALUE 'superadmin';

-- Make david@davidrosenqvist.se a superadmin
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  'superadmin'::app_role
FROM auth.users au
WHERE au.email = 'david@davidrosenqvist.se'
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove any existing admin role for david if it exists
DELETE FROM public.user_roles 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'david@davidrosenqvist.se'
) AND role = 'admin';

-- Update RLS policies to protect superadmins
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;

-- New policy: Superadmins can manage all roles, admins can manage non-superadmin roles
CREATE POLICY "Role management permissions"
ON public.user_roles
FOR ALL
USING (
  -- Superadmins can do everything
  public.has_role(auth.uid(), 'superadmin'::app_role) OR
  -- Admins can manage non-superadmin roles, but not their own admin role or superadmin roles
  (public.has_role(auth.uid(), 'admin'::app_role) AND 
   role != 'superadmin'::app_role AND 
   NOT (role = 'admin'::app_role AND user_id = auth.uid()))
)
WITH CHECK (
  -- Superadmins can do everything
  public.has_role(auth.uid(), 'superadmin'::app_role) OR
  -- Admins can manage non-superadmin roles, but not their own admin role or superadmin roles
  (public.has_role(auth.uid(), 'admin'::app_role) AND 
   role != 'superadmin'::app_role AND 
   NOT (role = 'admin'::app_role AND user_id = auth.uid()))
);

-- Update the has_role function to include superadmin check for admin operations
CREATE OR REPLACE FUNCTION public.current_user_is_admin_or_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::app_role, 'superadmin'::app_role)
  )
$$;