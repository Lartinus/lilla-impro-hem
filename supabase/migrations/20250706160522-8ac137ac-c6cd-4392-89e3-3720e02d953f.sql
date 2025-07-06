-- Add DELETE policy for admins on interest_signup_submissions
CREATE POLICY "Admins can delete interest signup submissions" 
ON public.interest_signup_submissions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create function to handle cleanup when interest submission is deleted
CREATE OR REPLACE FUNCTION public.cleanup_interest_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  interest_title TEXT;
  group_name TEXT;
  target_group_id UUID;
BEGIN
  -- Get the interest signup title
  SELECT title INTO interest_title
  FROM public.interest_signups
  WHERE id = OLD.interest_signup_id;
  
  IF interest_title IS NOT NULL THEN
    -- Find the corresponding email group
    group_name := 'Intresse: ' || interest_title;
    
    SELECT id INTO target_group_id
    FROM public.email_groups
    WHERE name = group_name AND is_active = true;
    
    IF target_group_id IS NOT NULL THEN
      -- Remove the contact from the email group
      DELETE FROM public.email_group_members
      WHERE group_id = target_group_id
        AND contact_id IN (
          SELECT id FROM public.email_contacts
          WHERE email = OLD.email
        );
      
      -- Also remove the contact from email_contacts if this was their only source
      -- (only if they don't have other activities like courses or tickets)
      DELETE FROM public.email_contacts
      WHERE email = OLD.email
        AND source = 'interest'
        AND source_id = OLD.interest_signup_id::text
        AND NOT EXISTS (
          -- Check if they have course bookings
          SELECT 1 FROM public.course_instances ci
          WHERE ci.is_active = true
          AND EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ci.table_name
          )
        )
        AND NOT EXISTS (
          -- Check if they have ticket purchases
          SELECT 1 FROM public.ticket_purchases
          WHERE buyer_email = OLD.email
          AND payment_status = 'paid'
        )
        AND NOT EXISTS (
          -- Check if they have other interest signups
          SELECT 1 FROM public.interest_signup_submissions
          WHERE email = OLD.email
          AND id != OLD.id
        );
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger to run cleanup function
CREATE TRIGGER cleanup_interest_submission_trigger
AFTER DELETE ON public.interest_signup_submissions
FOR EACH ROW EXECUTE FUNCTION public.cleanup_interest_submission();