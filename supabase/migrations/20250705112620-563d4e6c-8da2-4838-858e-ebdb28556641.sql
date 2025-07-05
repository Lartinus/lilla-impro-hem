-- Create email groups table
CREATE TABLE public.email_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email contacts table
CREATE TABLE public.email_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT, -- 'course', 'ticket', 'interest', 'manual'
  source_id TEXT, -- course table name, show slug, etc.
  metadata JSONB, -- additional data like course title, show title, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Create junction table for group memberships
CREATE TABLE public.email_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.email_groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.email_contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, contact_id)
);

-- Enable RLS
ALTER TABLE public.email_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for email_groups
CREATE POLICY "Admins can manage email groups" 
ON public.email_groups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for email_contacts
CREATE POLICY "Admins can manage email contacts" 
ON public.email_contacts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for email_group_members
CREATE POLICY "Admins can manage email group members" 
ON public.email_group_members 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_email_groups_updated_at
BEFORE UPDATE ON public.email_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_contacts_updated_at
BEFORE UPDATE ON public.email_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to sync contacts from various sources
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
    SELECT table_name, course_title FROM public.course_instances WHERE is_active = true
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
    buyer_email,
    buyer_name,
    buyer_phone,
    'ticket',
    show_slug,
    jsonb_build_object('show_title', show_title, 'show_date', show_date)
  FROM public.ticket_purchases
  WHERE payment_status = 'paid'
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

-- Create function to import contacts from specific course to a group
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
  contact_id UUID;
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
    RETURNING id INTO contact_id;

    -- If contact already existed, get its ID
    IF contact_id IS NULL THEN
      SELECT id INTO contact_id FROM public.email_contacts WHERE email = contact_record.email;
    END IF;

    -- Add to group
    INSERT INTO public.email_group_members (group_id, contact_id)
    VALUES (target_group_id, contact_id)
    ON CONFLICT (group_id, contact_id) DO NOTHING;

    imported_count := imported_count + 1;
  END LOOP;

  RETURN imported_count;
END;
$$;