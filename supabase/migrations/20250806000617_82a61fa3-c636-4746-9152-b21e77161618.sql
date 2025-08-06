-- Add columns for tracking ticket edits and resends
ALTER TABLE public.ticket_purchases
ADD COLUMN last_resent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resend_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Create RLS policy for updating ticket contact details (admin only)
CREATE POLICY "Admins can update ticket contact details" 
ON public.ticket_purchases 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update ticket contact details with audit logging
CREATE OR REPLACE FUNCTION public.update_ticket_contact_details(
  ticket_id_param UUID,
  new_buyer_name TEXT,
  new_buyer_email TEXT,
  new_buyer_phone TEXT,
  admin_user_id_param UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(admin_user_id_param, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Update the ticket contact details
  UPDATE public.ticket_purchases
  SET 
    buyer_name = new_buyer_name,
    buyer_email = new_buyer_email,
    buyer_phone = new_buyer_phone,
    updated_by = admin_user_id_param,
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Create function to update resend tracking
CREATE OR REPLACE FUNCTION public.update_ticket_resend_tracking(
  ticket_id_param UUID,
  admin_user_id_param UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(admin_user_id_param, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Update the resend tracking
  UPDATE public.ticket_purchases
  SET 
    last_resent_at = now(),
    resend_count = resend_count + 1,
    updated_by = admin_user_id_param,
    updated_at = now()
  WHERE id = ticket_id_param
    AND payment_status = 'paid';
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;