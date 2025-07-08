-- Add image_position field to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'top';