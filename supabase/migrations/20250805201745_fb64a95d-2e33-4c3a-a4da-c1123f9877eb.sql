-- Add columns for partial ticket scanning
ALTER TABLE public.ticket_purchases 
ADD COLUMN scanned_tickets integer DEFAULT 0,
ADD COLUMN partial_scan boolean DEFAULT false;

-- Update existing records to have correct scanned_tickets value
UPDATE public.ticket_purchases 
SET scanned_tickets = (regular_tickets + discount_tickets)
WHERE scanned_status = true;

-- Create updated function for partial ticket scanning
CREATE OR REPLACE FUNCTION public.update_partial_ticket_scan(
  ticket_id_param uuid, 
  scanned_tickets_param integer, 
  admin_user_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  total_tickets integer;
  current_scanned integer;
BEGIN
  -- Check if user is admin or staff
  IF NOT (public.has_role(admin_user_id_param, 'admin') OR public.has_role(admin_user_id_param, 'staff')) THEN
    RAISE EXCEPTION 'Access denied. Admin or staff role required.';
  END IF;

  -- Get total tickets and current scanned count
  SELECT (regular_tickets + discount_tickets), scanned_tickets
  INTO total_tickets, current_scanned
  FROM public.ticket_purchases
  WHERE id = ticket_id_param AND payment_status = 'paid';

  -- Validate that we don't exceed total tickets
  IF (current_scanned + scanned_tickets_param) > total_tickets THEN
    RAISE EXCEPTION 'Cannot scan more tickets than purchased';
  END IF;

  -- Update the ticket scanning status
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
    scanned_by = admin_user_id_param,
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  RETURN FOUND;
END;
$function$;

-- Update get_ticket_by_qr to include new fields
CREATE OR REPLACE FUNCTION public.get_ticket_by_qr(qr_data_param text)
RETURNS TABLE(
  id uuid, 
  show_title text, 
  show_date text, 
  show_location text, 
  buyer_name text, 
  buyer_email text, 
  regular_tickets integer, 
  discount_tickets integer, 
  total_amount integer, 
  scanned_status boolean, 
  scanned_at timestamp with time zone, 
  payment_status text,
  scanned_tickets integer,
  partial_scan boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
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