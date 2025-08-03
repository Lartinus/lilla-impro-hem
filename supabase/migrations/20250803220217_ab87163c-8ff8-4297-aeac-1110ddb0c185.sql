-- Update the course waitlist table to make phone optional
ALTER TABLE public.course_waitlist 
ALTER COLUMN phone DROP NOT NULL;

-- Update constraint to allow empty phone
ALTER TABLE public.course_waitlist 
DROP CONSTRAINT IF EXISTS course_waitlist_phone_check;

-- Add new constraint that allows empty phone
ALTER TABLE public.course_waitlist 
ADD CONSTRAINT course_waitlist_phone_check 
CHECK (phone IS NULL OR length(trim(phone)) = 0 OR length(trim(phone)) >= 6);