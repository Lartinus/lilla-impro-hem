-- Add scanning fields to ticket_purchases table
ALTER TABLE public.ticket_purchases 
ADD COLUMN scanned_status boolean NOT NULL DEFAULT false,
ADD COLUMN scanned_at timestamp with time zone,
ADD COLUMN scanned_by uuid;

-- Create function to update scanning status
CREATE OR REPLACE FUNCTION public.update_ticket_scan_status(
  ticket_id_param uuid,
  scanned_param boolean,
  admin_user_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(admin_user_id_param, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Update the ticket scanning status
  UPDATE public.ticket_purchases
  SET 
    scanned_status = scanned_param,
    scanned_at = CASE WHEN scanned_param THEN now() ELSE NULL END,
    scanned_by = CASE WHEN scanned_param THEN admin_user_id_param ELSE NULL END,
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';  -- Only allow scanning of paid tickets
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$function$;

-- Create function to get ticket by QR data
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
  payment_status text
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
    tp.payment_status
  FROM public.ticket_purchases tp
  WHERE tp.qr_data = qr_data_param
    AND tp.payment_status = 'paid'
  LIMIT 1;
END;
$function$;