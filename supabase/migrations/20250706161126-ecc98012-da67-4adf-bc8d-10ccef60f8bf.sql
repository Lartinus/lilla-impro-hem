-- First, clean up duplicate groups by deactivating old ones and keeping only the newest active one for each name
WITH latest_groups AS (
  SELECT DISTINCT ON (name) 
    id, name, created_at
  FROM public.email_groups 
  WHERE name LIKE 'Intresse:%'
  ORDER BY name, created_at DESC
)
UPDATE public.email_groups 
SET is_active = false 
WHERE name LIKE 'Intresse:%' 
  AND id NOT IN (SELECT id FROM latest_groups)
  AND is_active = true;

-- Improve the create_interest_group_if_not_exists function to handle race conditions better
CREATE OR REPLACE FUNCTION public.create_interest_group_if_not_exists(signup_title text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  group_id UUID;
  group_name TEXT;
BEGIN
  -- Create a standardized group name
  group_name := 'Intresse: ' || signup_title;
  
  -- Try to find existing active group first
  SELECT id INTO group_id
  FROM public.email_groups
  WHERE name = group_name AND is_active = true
  LIMIT 1;
  
  -- If group doesn't exist, try to create it
  IF group_id IS NULL THEN
    -- Use INSERT ... ON CONFLICT to handle race conditions
    INSERT INTO public.email_groups (name, description, is_active)
    VALUES (
      group_name,
      'Automatiskt skapad grupp för intresseanmälningar till: ' || signup_title,
      true
    )
    ON CONFLICT (name) DO UPDATE SET
      is_active = true,
      description = EXCLUDED.description,
      updated_at = now()
    RETURNING id INTO group_id;
    
    -- If INSERT didn't return an ID (due to conflict), try to find it again
    IF group_id IS NULL THEN
      SELECT id INTO group_id
      FROM public.email_groups
      WHERE name = group_name AND is_active = true
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN group_id;
END;
$$;

-- Add unique constraint on email_groups name to prevent duplicates
ALTER TABLE public.email_groups 
ADD CONSTRAINT email_groups_name_unique UNIQUE (name);