-- Add unique constraint to prevent duplicate interest signups
ALTER TABLE public.interest_signup_submissions 
ADD CONSTRAINT unique_email_per_interest 
UNIQUE (email, interest_signup_id);

-- Clean up existing duplicates by keeping only the most recent submission for each email+interest combination
DELETE FROM public.interest_signup_submissions 
WHERE id NOT IN (
  SELECT DISTINCT ON (email, interest_signup_id) id
  FROM public.interest_signup_submissions
  ORDER BY email, interest_signup_id, created_at DESC
);