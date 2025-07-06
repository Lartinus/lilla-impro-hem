-- Create function to automatically create and manage interest groups
CREATE OR REPLACE FUNCTION public.create_interest_group_if_not_exists(
  signup_title TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  group_id UUID;
  group_name TEXT;
BEGIN
  -- Create a standardized group name
  group_name := 'Intresse: ' || signup_title;
  
  -- Check if group already exists
  SELECT id INTO group_id
  FROM public.email_groups
  WHERE name = group_name AND is_active = true;
  
  -- If group doesn't exist, create it
  IF group_id IS NULL THEN
    INSERT INTO public.email_groups (name, description, is_active)
    VALUES (
      group_name,
      'Automatiskt skapad grupp för intresseanmälningar till: ' || signup_title,
      true
    )
    RETURNING id INTO group_id;
  END IF;
  
  RETURN group_id;
END;
$$;

-- Create function to automatically add interest signup to group
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
  INSERT INTO public.email_group_members (group_id, contact_id)
  VALUES (group_id, contact_id)
  ON CONFLICT (group_id, contact_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic interest group management
DROP TRIGGER IF EXISTS auto_interest_group_trigger ON public.interest_signup_submissions;
CREATE TRIGGER auto_interest_group_trigger
  AFTER INSERT ON public.interest_signup_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_interest_signup();

-- Create function to get contact activities (courses and interests)
CREATE OR REPLACE FUNCTION public.get_contact_activities(contact_email TEXT)
RETURNS TABLE(
  activity_type TEXT,
  activity_title TEXT,
  activity_date TIMESTAMP WITH TIME ZONE,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  course_record RECORD;
  participant_record RECORD;
BEGIN
  -- Get interest signups
  RETURN QUERY
  SELECT 
    'interest'::TEXT as activity_type,
    ist.title as activity_title,
    iss.created_at as activity_date,
    jsonb_build_object(
      'message', iss.message,
      'phone', iss.phone
    ) as details
  FROM public.interest_signup_submissions iss
  JOIN public.interest_signups ist ON iss.interest_signup_id = ist.id
  WHERE iss.email = contact_email
  ORDER BY iss.created_at DESC;
  
  -- Get course participations
  FOR course_record IN 
    SELECT ci.table_name, ci.course_title 
    FROM public.course_instances ci 
    WHERE ci.is_active = true
  LOOP
    BEGIN
      FOR participant_record IN 
        EXECUTE format('
          SELECT name, phone, created_at
          FROM public.%I 
          WHERE email = $1
        ', course_record.table_name)
        USING contact_email
      LOOP
        RETURN QUERY
        SELECT 
          'course'::TEXT as activity_type,
          course_record.course_title as activity_title,
          participant_record.created_at as activity_date,
          jsonb_build_object(
            'table_name', course_record.table_name,
            'phone', participant_record.phone
          ) as details;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      -- Skip tables that don't exist or have issues
      CONTINUE;
    END;
  END LOOP;
  
  -- Get ticket purchases
  RETURN QUERY
  SELECT 
    'ticket'::TEXT as activity_type,
    tp.show_title as activity_title,
    tp.created_at as activity_date,
    jsonb_build_object(
      'show_slug', tp.show_slug,
      'show_date', tp.show_date,
      'show_location', tp.show_location,
      'total_tickets', tp.regular_tickets + tp.discount_tickets,
      'total_amount', tp.total_amount,
      'payment_status', tp.payment_status
    ) as details
  FROM public.ticket_purchases tp
  WHERE tp.buyer_email = contact_email
  ORDER BY tp.created_at DESC;
END;
$$;