-- Check current user_roles and add the first admin if needed
-- First, let's see what we have
SELECT * FROM user_roles;

-- Add your user as admin (you'll need to get your actual user_id)
-- This is a temporary solution to bootstrap the first admin
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'david@davidrosenqvist.se'
ON CONFLICT (user_id, role) DO NOTHING;