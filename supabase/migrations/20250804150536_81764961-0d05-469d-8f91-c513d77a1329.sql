-- Fix all remaining multiple permissive policies by properly separating policy types
-- The issue is that FOR ALL policies overlap with specific SELECT policies

-- Fix actors table
DROP POLICY IF EXISTS "View actors" ON public.actors;
DROP POLICY IF EXISTS "Admins can modify actors" ON public.actors;

CREATE POLICY "View actors" 
ON public.actors 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert actors" 
ON public.actors 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update actors" 
ON public.actors 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete actors" 
ON public.actors 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix admin_shows table
DROP POLICY IF EXISTS "View active shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins can manage shows" ON public.admin_shows;

CREATE POLICY "View shows" 
ON public.admin_shows 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert shows" 
ON public.admin_shows 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update shows" 
ON public.admin_shows 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete shows" 
ON public.admin_shows 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_waitlist table
DROP POLICY IF EXISTS "Admins can manage waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Public can join waitlist" ON public.course_waitlist;

CREATE POLICY "View waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Join waitlist" 
ON public.course_waitlist 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update waitlist entries" 
ON public.course_waitlist 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete waitlist entries" 
ON public.course_waitlist 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix interest_signups table
DROP POLICY IF EXISTS "Admins can manage interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "View visible interest signups" ON public.interest_signups;

CREATE POLICY "View interest signups" 
ON public.interest_signups 
FOR SELECT 
USING (is_visible = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert interest signups" 
ON public.interest_signups 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update interest signups" 
ON public.interest_signups 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete interest signups" 
ON public.interest_signups 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix performers table
DROP POLICY IF EXISTS "Admins can manage performers" ON public.performers;
DROP POLICY IF EXISTS "View active performers" ON public.performers;

CREATE POLICY "View performers" 
ON public.performers 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert performers" 
ON public.performers 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update performers" 
ON public.performers 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete performers" 
ON public.performers 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix show_performers table
DROP POLICY IF EXISTS "Admins can modify show performers" ON public.show_performers;
DROP POLICY IF EXISTS "View show performers" ON public.show_performers;

CREATE POLICY "View show performers" 
ON public.show_performers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert show performers" 
ON public.show_performers 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update show performers" 
ON public.show_performers 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete show performers" 
ON public.show_performers 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix show_tags table
DROP POLICY IF EXISTS "Admins can manage show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Anyone can view active show tags" ON public.show_tags;

CREATE POLICY "View show tags" 
ON public.show_tags 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert show tags" 
ON public.show_tags 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update show tags" 
ON public.show_tags 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete show tags" 
ON public.show_tags 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix venues table
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view active venues" ON public.venues;

CREATE POLICY "View venues" 
ON public.venues 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert venues" 
ON public.venues 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update venues" 
ON public.venues 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete venues" 
ON public.venues 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix duplicate index issue on admin_shows
DROP INDEX IF EXISTS idx_admin_shows_date;
-- Keep idx_admin_shows_show_date as it's the more descriptive name