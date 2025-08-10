-- Phase 1: Tighten critical RLS policies and harden sensitive functions

-- 1) Remove overly-permissive payment status UPDATE policies
DROP POLICY IF EXISTS "Can update payment status" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Can update payment status" ON public.course_purchases;

-- 2) Lock down course_offers visibility and updates
DROP POLICY IF EXISTS "Public can update offer status" ON public.course_offers;
DROP POLICY IF EXISTS "View course offers" ON public.course_offers;

-- Admins only can view course offers
CREATE POLICY "Admins and superadmins can view course offers"
ON public.course_offers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- 3) Restrict course_instances creation to admins only
DROP POLICY IF EXISTS "Public can create course instances" ON public.course_instances;

CREATE POLICY "Admins and superadmins can insert course instances"
ON public.course_instances
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Note: ticket_bookings policies will be adjusted alongside frontend changes in a follow-up to avoid breaking flows.

-- 4) Harden sensitive SECURITY DEFINER functions to use auth.uid() instead of caller-supplied IDs

-- update_ticket_scan_status: allow admin or staff, ignore provided admin_user_id_param for auth
CREATE OR REPLACE FUNCTION public.update_ticket_scan_status(ticket_id_param uuid, scanned_param boolean, admin_user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Enforce role via auth.uid(), not supplied parameter
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) THEN
    RAISE EXCEPTION 'Access denied. Admin or staff role required.';
  END IF;

  -- Update the ticket scanning status; attribute action to auth.uid()
  UPDATE public.ticket_purchases
  SET 
    scanned_status = scanned_param,
    scanned_at = CASE WHEN scanned_param THEN now() ELSE NULL END,
    scanned_by = CASE WHEN scanned_param THEN auth.uid() ELSE NULL END,
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  RETURN FOUND;
END;
$function$;

-- update_partial_ticket_scan: enforce role via auth.uid(), attribute actions to auth.uid()
CREATE OR REPLACE FUNCTION public.update_partial_ticket_scan(ticket_id_param uuid, scanned_tickets_param integer, admin_user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  total_tickets integer;
  current_scanned integer;
BEGIN
  -- Enforce role via auth.uid()
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) THEN
    RAISE EXCEPTION 'Access denied. Admin or staff role required.';
  END IF;

  -- Get total tickets and current scanned count
  SELECT (regular_tickets + discount_tickets), scanned_tickets
  INTO total_tickets, current_scanned
  FROM public.ticket_purchases
  WHERE id = ticket_id_param AND payment_status = 'paid';

  IF (current_scanned + scanned_tickets_param) > total_tickets THEN
    RAISE EXCEPTION 'Cannot scan more tickets than purchased';
  END IF;

  UPDATE public.ticket_purchases
  SET 
    scanned_tickets = current_scanned + scanned_tickets_param,
    scanned_status = (current_scanned + scanned_tickets_param) >= total_tickets,
    partial_scan = (current_scanned + scanned_tickets_param) < total_tickets,
    scanned_at = CASE 
      WHEN (current_scanned + scanned_tickets_param) >= total_tickets THEN now() 
      WHEN current_scanned = 0 THEN now()
      ELSE scanned_at 
    END,
    scanned_by = auth.uid(),
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  RETURN FOUND;
END;
$function$;

-- update_ticket_resend_tracking: enforce admin via auth.uid()
CREATE OR REPLACE FUNCTION public.update_ticket_resend_tracking(ticket_id_param uuid, admin_user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  UPDATE public.ticket_purchases
  SET 
    last_resent_at = now(),
    resend_count = resend_count + 1,
    updated_by = auth.uid(),
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  RETURN FOUND;
END;
$function$;

-- update_ticket_contact_details: enforce admin via auth.uid(), attribute action to auth.uid()
CREATE OR REPLACE FUNCTION public.update_ticket_contact_details(ticket_id_param uuid, new_buyer_name text, new_buyer_email text, new_buyer_phone text, admin_user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  UPDATE public.ticket_purchases
  SET 
    buyer_name = new_buyer_name,
    buyer_email = new_buyer_email,
    buyer_phone = new_buyer_phone,
    updated_by = auth.uid(),
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  RETURN FOUND;
END;
$function$;

-- admin_delete_participant: require admin role
CREATE OR REPLACE FUNCTION public.admin_delete_participant(table_name text, participant_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = admin_delete_participant.table_name
  ) THEN
    RETURN FALSE;
  END IF;
  
  EXECUTE format('DELETE FROM public.%I WHERE email = $1', admin_delete_participant.table_name) 
  USING participant_email;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- delete_course_participant_admin: require admin role
CREATE OR REPLACE FUNCTION public.delete_course_participant_admin(p_table_name text, p_participant_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table_name
  ) THEN
    RETURN FALSE;
  END IF;
  
  PERFORM set_config('role', 'service_role', true);
  
  EXECUTE format('DELETE FROM public.%I WHERE lower(email) = $1', p_table_name) 
  USING lower(p_participant_email);
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN rows_affected > 0;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in delete_course_participant_admin: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

-- get_ticket_by_qr: restrict to admin or staff
CREATE OR REPLACE FUNCTION public.get_ticket_by_qr(qr_data_param text)
RETURNS TABLE(id uuid, show_title text, show_date text, show_location text, buyer_name text, buyer_email text, regular_tickets integer, discount_tickets integer, total_amount integer, scanned_status boolean, scanned_at timestamp with time zone, payment_status text, scanned_tickets integer, partial_scan boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')) THEN
    RAISE EXCEPTION 'Access denied. Admin or staff role required.';
  END IF;

  RETURN QUERY
  SELECT 
    tp.id,
    tp.show_title,
    tp.show_date,
    tp.show_location,
    tp.buyer_name,
    tp.buyer_email,
    tp.regular_tickets,
    tp.discount_tickets,
    tp.total_amount,
    tp.scanned_status,
    tp.scanned_at,
    tp.payment_status,
    tp.scanned_tickets,
    tp.partial_scan
  FROM public.ticket_purchases tp
  WHERE tp.qr_data = qr_data_param
    AND tp.payment_status = 'paid'
  LIMIT 1;
END;
$function$;

-- get_contact_activities: restrict to admins only (to avoid PII leakage)
CREATE OR REPLACE FUNCTION public.get_contact_activities(contact_email text)
RETURNS TABLE(activity_type text, activity_title text, activity_date timestamp with time zone, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  course_record RECORD;
  participant_record RECORD;
BEGIN
  -- Only admins/superadmins can access contact activity history
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin')) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Interest signups
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
  
  -- Course participations
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
      CONTINUE;
    END;
  END LOOP;
  
  -- Ticket purchases
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
$function$;
