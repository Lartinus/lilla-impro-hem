-- Add title and background_image fields to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS background_image TEXT;