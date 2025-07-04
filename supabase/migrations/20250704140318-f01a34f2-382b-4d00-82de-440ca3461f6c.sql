-- Add sort_order column to course_instances table
ALTER TABLE public.course_instances 
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Update existing courses with sort_order based on created_at
UPDATE public.course_instances 
SET sort_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC)
  FROM public.course_instances ci2 
  WHERE ci2.id = course_instances.id
)
WHERE sort_order = 0;