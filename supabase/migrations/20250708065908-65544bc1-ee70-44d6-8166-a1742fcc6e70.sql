-- Add title_size field to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS title_size TEXT DEFAULT '32';