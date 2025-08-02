-- Add admin delete policy for ticket_purchases
CREATE POLICY "Admins can delete ticket purchases"
ON public.ticket_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));