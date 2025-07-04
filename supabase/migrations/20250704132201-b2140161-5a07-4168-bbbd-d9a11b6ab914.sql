-- Add course_info and practical_info columns to course_instances table
ALTER TABLE public.course_instances 
ADD COLUMN course_info TEXT,
ADD COLUMN practical_info TEXT;