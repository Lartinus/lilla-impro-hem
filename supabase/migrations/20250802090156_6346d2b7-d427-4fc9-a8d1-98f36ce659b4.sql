-- Add refund tracking columns to ticket_purchases table
ALTER TABLE public.ticket_purchases 
ADD COLUMN refund_status text DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'processed')),
ADD COLUMN refund_date timestamp with time zone,
ADD COLUMN refund_reason text;