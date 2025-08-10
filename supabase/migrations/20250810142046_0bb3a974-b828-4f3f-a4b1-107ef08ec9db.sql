-- Add toggle column for small/large course card on course instances
ALTER TABLE public.course_instances
ADD COLUMN IF NOT EXISTS use_small_card boolean NOT NULL DEFAULT false;