-- Add price and session fields to course_instances table
ALTER TABLE public.course_instances 
ADD COLUMN IF NOT EXISTS price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sessions integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS hours_per_session numeric DEFAULT 2;