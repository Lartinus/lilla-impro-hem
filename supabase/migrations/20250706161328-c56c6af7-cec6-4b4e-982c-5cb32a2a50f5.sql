-- Update the create_interest_group_if_not_exists function to handle the unique constraint
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
    -- Use INSERT ... ON CONFLICT to handle race conditions with the unique constraint
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
    
    -- If INSERT didn't return an ID (due to conflict), find the existing one
    IF group_id IS NULL THEN
      SELECT id INTO group_id
      FROM public.email_groups
      WHERE name = group_name
      LIMIT 1;
      
      -- Make sure it's active
      UPDATE public.email_groups 
      SET is_active = true, updated_at = now()
      WHERE id = group_id AND NOT is_active;
    END IF;
  END IF;
  
  RETURN group_id;
END;
$$;