-- Fix all ambiguous column references in the functions I created

-- Fix get_contact_activities function
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

-- Fix import_course_to_group function
CREATE OR REPLACE FUNCTION public.import_course_to_group(
  course_table_name TEXT,
  target_group_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  imported_count INTEGER := 0;
  contact_record RECORD;
  found_contact_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Import contacts from course table
  FOR contact_record IN 
    EXECUTE format('SELECT name, email, phone FROM public.%I', course_table_name)
  LOOP
    -- Insert or get contact
    INSERT INTO public.email_contacts (email, name, phone, source, source_id)
    VALUES (contact_record.email, contact_record.name, contact_record.phone, 'course', course_table_name)
    ON CONFLICT (email) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, email_contacts.name),
      phone = COALESCE(EXCLUDED.phone, email_contacts.phone),
      updated_at = now()
    RETURNING id INTO found_contact_id;

    -- If contact already existed, get its ID
    IF found_contact_id IS NULL THEN
      SELECT ec.id INTO found_contact_id 
      FROM public.email_contacts ec 
      WHERE ec.email = contact_record.email;
    END IF;

    -- Add to group
    INSERT INTO public.email_group_members (group_id, contact_id)
    VALUES (target_group_id, found_contact_id)
    ON CONFLICT (group_id, contact_id) DO NOTHING;

    imported_count := imported_count + 1;
  END LOOP;

  RETURN imported_count;
END;
$$;