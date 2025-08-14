-- Add policies for course_instances table
-- This table is missing RLS policies which is causing the warning

CREATE POLICY "Admins and superadmins can manage course instances"
ON public.course_instances
FOR ALL
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'superadmin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'superadmin'::text));