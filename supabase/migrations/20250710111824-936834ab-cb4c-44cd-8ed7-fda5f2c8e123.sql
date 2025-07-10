-- Add missing fields to course_instances table for better course scheduling
ALTER TABLE public.course_instances 
ADD COLUMN IF NOT EXISTS start_time time without time zone DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS weekday text,
ADD COLUMN IF NOT EXISTS price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sessions integer DEFAULT 8,
ADD COLUMN IF NOT EXISTS hours_per_session numeric DEFAULT 2.5;

-- Update existing records to have default values
UPDATE public.course_instances 
SET 
  start_time = '18:00:00'
WHERE start_time IS NULL;

-- Add a unique constraint to prevent duplicate course instances with same name, date and time
CREATE UNIQUE INDEX IF NOT EXISTS course_instances_unique_schedule 
ON public.course_instances (course_title, start_date, start_time) 
WHERE is_active = true;