-- Fix sync_email_contacts function ambiguous column references
CREATE OR REPLACE FUNCTION public.sync_email_contacts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  synced_count INTEGER := 0;
  course_record RECORD;
  contact_record RECORD;
BEGIN
  -- Sync from course bookings
  FOR course_record IN 
    SELECT ci.table_name, ci.course_title FROM public.course_instances ci WHERE ci.is_active = true
  LOOP
    BEGIN
      FOR contact_record IN 
        EXECUTE format('SELECT name, email, phone FROM public.%I', course_record.table_name)
      LOOP
        INSERT INTO public.email_contacts (email, name, phone, source, source_id, metadata)
        VALUES (
          contact_record.email,
          contact_record.name,
          contact_record.phone,
          'course',
          course_record.table_name,
          jsonb_build_object('course_title', course_record.course_title)
        )
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, email_contacts.name),
          phone = COALESCE(EXCLUDED.phone, email_contacts.phone),
          updated_at = now();
        
        synced_count := synced_count + 1;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      -- Skip tables that don't exist or have issues
      CONTINUE;
    END;
  END LOOP;

  -- Sync from ticket purchases
  INSERT INTO public.email_contacts (email, name, phone, source, source_id, metadata)
  SELECT DISTINCT
    tp.buyer_email,
    tp.buyer_name,
    tp.buyer_phone,
    'ticket',
    tp.show_slug,
    jsonb_build_object('show_title', tp.show_title, 'show_date', tp.show_date)
  FROM public.ticket_purchases tp
  WHERE tp.payment_status = 'paid'
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, email_contacts.name),
    phone = COALESCE(EXCLUDED.phone, email_contacts.phone),
    updated_at = now();

  -- Sync from interest signups
  INSERT INTO public.email_contacts (email, name, phone, source, source_id, metadata)
  SELECT DISTINCT
    iss.email,
    iss.name,
    iss.phone,
    'interest',
    iss.interest_signup_id::text,
    jsonb_build_object('interest_title', ist.title)
  FROM public.interest_signup_submissions iss
  JOIN public.interest_signups ist ON iss.interest_signup_id = ist.id
  ON CONFLICT (email) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, email_contacts.name),
    phone = COALESCE(EXCLUDED.phone, email_contacts.phone),
    updated_at = now();

  RETURN synced_count;
END;
$$;