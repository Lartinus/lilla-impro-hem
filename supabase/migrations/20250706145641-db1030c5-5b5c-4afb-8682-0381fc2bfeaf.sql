-- Fix the ambiguous column reference in the handle_interest_signup function
CREATE OR REPLACE FUNCTION public.handle_interest_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  signup_title TEXT;
  group_id UUID;
  contact_id UUID;
BEGIN
  -- Get the interest signup title
  SELECT title INTO signup_title
  FROM public.interest_signups
  WHERE id = NEW.interest_signup_id;
  
  -- Create or get interest group
  group_id := public.create_interest_group_if_not_exists(signup_title);
  
  -- Add contact to email_contacts (or update if exists)
  INSERT INTO public.email_contacts (email, name, phone, source, source_id, metadata)
  VALUES (
    NEW.email,
    NEW.name,
    NEW.phone,
    'interest',
    NEW.interest_signup_id::text,
    jsonb_build_object('interest_title', signup_title, 'message', NEW.message)
  )
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, email_contacts.name),
    phone = COALESCE(EXCLUDED.phone, email_contacts.phone),
    metadata = CASE 
      WHEN email_contacts.source = 'interest' THEN
        COALESCE(email_contacts.metadata, '{}'::jsonb) || EXCLUDED.metadata
      ELSE 
        EXCLUDED.metadata
    END,
    updated_at = now()
  RETURNING id INTO contact_id;
  
  -- Add to group if not already a member
  -- Fix: Use explicit table aliases to avoid ambiguous column references
  INSERT INTO public.email_group_members (group_id, contact_id)
  VALUES (group_id, contact_id)
  ON CONFLICT (email_group_members.group_id, email_group_members.contact_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;