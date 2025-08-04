-- Fix remaining RLS performance issues and multiple permissive policies
-- This will resolve all the remaining Supabase linter warnings

-- Fix course booking tables RLS policies
DROP POLICY IF EXISTS "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_rea" ON public.course_niv__2___improv_comedy__l_ngform_1753659988035;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_upd" ON public.course_niv__2___improv_comedy__l_ngform_1753659988035;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_del" ON public.course_niv__2___improv_comedy__l_ngform_1753659988035;

CREATE POLICY "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_read" 
ON public.course_niv__2___improv_comedy__l_ngform_1753659988035 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_update" 
ON public.course_niv__2___improv_comedy__l_ngform_1753659988035 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy__l_ngform_1753659988035_admin_delete" 
ON public.course_niv__2___improv_comedy__l_ngform_1753659988035 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix other course booking table
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_delet" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_updat" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_read" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_read" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_update" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_delete" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_improboost table
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_read" ON public.course_improboost__1752182394475;
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_update" ON public.course_improboost__1752182394475;
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_delete" ON public.course_improboost__1752182394475;

CREATE POLICY "course_improboost__1752182394475_admin_read" 
ON public.course_improboost__1752182394475 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_improboost__1752182394475_admin_update" 
ON public.course_improboost__1752182394475 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "course_improboost__1752182394475_admin_delete" 
ON public.course_improboost__1752182394475 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix show_performers policies (both RLS and multiple permissive)
DROP POLICY IF EXISTS "Admins can manage show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Anyone can view show performers" ON public.show_performers;

CREATE POLICY "View show performers" 
ON public.show_performers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can modify show performers" 
ON public.show_performers 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_purchases policy
DROP POLICY IF EXISTS "Admins can view all course purchases" ON public.course_purchases;
CREATE POLICY "Admins can view all course purchases" 
ON public.course_purchases 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

-- Fix ticket_purchases policy
DROP POLICY IF EXISTS "Admins can delete ticket purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins can view all ticket purchases" ON public.ticket_purchases;

CREATE POLICY "Admins can view all ticket purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete ticket purchases" 
ON public.ticket_purchases 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix security_audit_log policy
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_offers policies (both RLS and multiple permissive)
DROP POLICY IF EXISTS "Admins can view all course offers" ON public.course_offers;
DROP POLICY IF EXISTS "Admins can create course offers" ON public.course_offers;
DROP POLICY IF EXISTS "Public can view valid offers by token" ON public.course_offers;

CREATE POLICY "View course offers" 
ON public.course_offers 
FOR SELECT 
USING (
  has_role((select auth.uid()), 'admin') OR 
  ((status = 'sent'::text) AND (expires_at > now()))
);

CREATE POLICY "Admins can create course offers" 
ON public.course_offers 
FOR INSERT 
WITH CHECK (has_role((select auth.uid()), 'admin'));

-- Fix admin_shows policies (multiple permissive)
DROP POLICY IF EXISTS "Anyone can view active shows" ON public.admin_shows;
-- Keep the optimized admin policy we already created

CREATE POLICY "View active shows" 
ON public.admin_shows 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

-- Fix actors policies (fix the SELECT overlap we created earlier)
DROP POLICY IF EXISTS "View and manage actors" ON public.actors;
DROP POLICY IF EXISTS "Admins can modify actors" ON public.actors;

CREATE POLICY "View actors" 
ON public.actors 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can modify actors" 
ON public.actors 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_waitlist policies (multiple permissive for INSERT)
DROP POLICY IF EXISTS "Public can join waitlist" ON public.course_waitlist;
-- Keep the admin policy we already optimized

CREATE POLICY "Public can join waitlist" 
ON public.course_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Fix interest_signups policies (multiple permissive)
DROP POLICY IF EXISTS "Anyone can view visible interest signups" ON public.interest_signups;
-- Keep the optimized admin policy

CREATE POLICY "View visible interest signups" 
ON public.interest_signups 
FOR SELECT 
USING (is_visible = true OR has_role((select auth.uid()), 'admin'));

-- Fix performers policies (multiple permissive)
DROP POLICY IF EXISTS "Anyone can view active performers" ON public.performers;
-- Keep the optimized admin policy

CREATE POLICY "View active performers" 
ON public.performers 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));