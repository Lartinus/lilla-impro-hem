-- Add superadmin role to the enum (separate transaction)
ALTER TYPE public.app_role ADD VALUE 'superadmin';