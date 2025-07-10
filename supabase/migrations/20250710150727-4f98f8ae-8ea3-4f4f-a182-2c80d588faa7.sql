-- Add DELETE policy for admins on course tables
CREATE POLICY "course_niv__1_1752147042033_admin_delete" 
ON public.course_niv__1_1752147042033 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Also add UPDATE policy for admins (for future use)
CREATE POLICY "course_niv__1_1752147042033_admin_update" 
ON public.course_niv__1_1752147042033 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));