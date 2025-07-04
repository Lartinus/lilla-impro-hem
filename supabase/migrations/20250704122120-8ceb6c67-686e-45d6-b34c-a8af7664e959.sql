INSERT INTO public.user_roles (user_id, role)
SELECT auth.users.id, 'admin'::app_role
FROM auth.users 
WHERE auth.users.email = 'david@davidrosenqvist.se'
ON CONFLICT (user_id, role) DO NOTHING;