-- Update the handle_interest_signup function to work without net extension
CREATE OR REPLACE FUNCTION public.handle_interest_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  signup_title TEXT;
  target_group_id UUID;
  found_contact_id UUID;
BEGIN
  -- Get the interest signup title
  SELECT title INTO signup_title
  FROM public.interest_signups
  WHERE id = NEW.interest_signup_id;
  
  -- Create or get interest group
  target_group_id := public.create_interest_group_if_not_exists(signup_title);
  
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
  RETURNING id INTO found_contact_id;
  
  -- Add to group if not already a member
  INSERT INTO public.email_group_members (group_id, contact_id)
  VALUES (target_group_id, found_contact_id)
  ON CONFLICT (group_id, contact_id) DO NOTHING;
  
  -- Log the interest signup for potential email sending
  RAISE NOTICE 'Interest signup completed for: % (%), interest: %', NEW.name, NEW.email, signup_title;
  
  RETURN NEW;
END;
$$;