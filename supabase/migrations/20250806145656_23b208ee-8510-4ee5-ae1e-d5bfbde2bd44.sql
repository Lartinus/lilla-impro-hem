-- Update RLS policy for course_templates to include superadmin
DROP POLICY IF EXISTS "Admins can manage course templates" ON public.course_templates;

CREATE POLICY "Admins and superadmins can manage course templates" 
ON public.course_templates 
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));