-- Add completed_at column to course_instances for manual completion
ALTER TABLE public.course_instances ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when filtering by completion status
CREATE INDEX idx_course_instances_completed_at ON public.course_instances(completed_at);

-- Add index for better performance when filtering shows by date
CREATE INDEX idx_admin_shows_show_date ON public.admin_shows(show_date);