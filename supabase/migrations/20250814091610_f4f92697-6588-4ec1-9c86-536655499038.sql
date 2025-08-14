-- Fix RLS performance issues by optimizing auth function calls
-- Replace direct auth.uid() calls with (select auth.uid()) subqueries

-- Drop existing policies that have performance issues
DROP POLICY IF EXISTS "Admins and superadmins can view all course bookings" ON public.course_bookings;
DROP POLICY IF EXISTS "admin_delete" ON public.course_bookings;
DROP POLICY IF EXISTS "admin_update" ON public.course_bookings;
DROP POLICY IF EXISTS "Role management permissions" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and superadmins can delete course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Admins and superadmins can insert course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Admins and superadmins can manage course instances" ON public.course_instances;
DROP POLICY IF EXISTS "View course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Admins and superadmins can delete ticket purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins and superadmins can update ticket contact details" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins and superadmins can view all ticket purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins and superadmins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins and superadmins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins and superadmins can delete performers" ON public.performers;
DROP POLICY IF EXISTS "Admins and superadmins can insert performers" ON public.performers;
DROP POLICY IF EXISTS "Admins and superadmins can update performers" ON public.performers;
DROP POLICY IF EXISTS "View performers" ON public.performers;
DROP POLICY IF EXISTS "Admins and superadmins can delete interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "Admins and superadmins can insert interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "Admins and superadmins can update interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "View interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "Admins and superadmins can delete interest signup submissions" ON public.interest_signup_submissions;
DROP POLICY IF EXISTS "Admins and superadmins can view interest signup submissions" ON public.interest_signup_submissions;
DROP POLICY IF EXISTS "Admins and superadmins can delete shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins and superadmins can insert shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins and superadmins can update shows" ON public.admin_shows;
DROP POLICY IF EXISTS "View shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins and superadmins can manage discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Admins and superadmins can delete show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Admins and superadmins can insert show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Admins and superadmins can update show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Admins and superadmins can delete venues" ON public.venues;
DROP POLICY IF EXISTS "Admins and superadmins can insert venues" ON public.venues;
DROP POLICY IF EXISTS "Admins and superadmins can update venues" ON public.venues;
DROP POLICY IF EXISTS "View venues" ON public.venues;
DROP POLICY IF EXISTS "Admins and superadmins can delete actors" ON public.actors;
DROP POLICY IF EXISTS "Admins and superadmins can insert actors" ON public.actors;
DROP POLICY IF EXISTS "Admins and superadmins can update actors" ON public.actors;
DROP POLICY IF EXISTS "View actors" ON public.actors;
DROP POLICY IF EXISTS "Admins and superadmins can manage email groups" ON public.email_groups;
DROP POLICY IF EXISTS "Admins and superadmins can manage email contacts" ON public.email_contacts;

-- Recreate policies with optimized auth function calls

-- course_bookings
CREATE POLICY "Admins and superadmins can view all course bookings" 
ON public.course_bookings 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "admin_delete" 
ON public.course_bookings 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "admin_update" 
ON public.course_bookings 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'));

-- user_roles
CREATE POLICY "Role management permissions" 
ON public.user_roles 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'superadmin'::app_role) OR (has_role((SELECT auth.uid()), 'admin'::app_role) AND (role <> 'superadmin'::app_role) AND (NOT ((role = 'admin'::app_role) AND (user_id = (SELECT auth.uid()))))))
WITH CHECK (has_role((SELECT auth.uid()), 'superadmin'::app_role) OR (has_role((SELECT auth.uid()), 'admin'::app_role) AND (role <> 'superadmin'::app_role) AND (NOT ((role = 'admin'::app_role) AND (user_id = (SELECT auth.uid()))))));

-- course_instances
CREATE POLICY "Admins and superadmins can delete course instances" 
ON public.course_instances 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert course instances" 
ON public.course_instances 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can manage course instances" 
ON public.course_instances 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View course instances" 
ON public.course_instances 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- ticket_purchases
CREATE POLICY "Admins and superadmins can delete ticket purchases" 
ON public.ticket_purchases 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update ticket contact details" 
ON public.ticket_purchases 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view all ticket purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- inquiries
CREATE POLICY "Admins and superadmins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view all inquiries" 
ON public.inquiries 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- performers
CREATE POLICY "Admins and superadmins can delete performers" 
ON public.performers 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert performers" 
ON public.performers 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update performers" 
ON public.performers 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View performers" 
ON public.performers 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- interest_signups
CREATE POLICY "Admins and superadmins can delete interest signups" 
ON public.interest_signups 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert interest signups" 
ON public.interest_signups 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update interest signups" 
ON public.interest_signups 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View interest signups" 
ON public.interest_signups 
FOR SELECT 
USING ((is_visible = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- interest_signup_submissions
CREATE POLICY "Admins and superadmins can delete interest signup submissions" 
ON public.interest_signup_submissions 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view interest signup submissions" 
ON public.interest_signup_submissions 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- admin_shows
CREATE POLICY "Admins and superadmins can delete shows" 
ON public.admin_shows 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert shows" 
ON public.admin_shows 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update shows" 
ON public.admin_shows 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View shows" 
ON public.admin_shows 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- discount_codes
CREATE POLICY "Admins and superadmins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- show_performers
CREATE POLICY "Admins and superadmins can delete show performers" 
ON public.show_performers 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert show performers" 
ON public.show_performers 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update show performers" 
ON public.show_performers 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- venues
CREATE POLICY "Admins and superadmins can delete venues" 
ON public.venues 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert venues" 
ON public.venues 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update venues" 
ON public.venues 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View venues" 
ON public.venues 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- actors
CREATE POLICY "Admins and superadmins can delete actors" 
ON public.actors 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert actors" 
ON public.actors 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update actors" 
ON public.actors 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View actors" 
ON public.actors 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- email_groups
CREATE POLICY "Admins and superadmins can manage email groups" 
ON public.email_groups 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- email_contacts
CREATE POLICY "Admins and superadmins can manage email contacts" 
ON public.email_contacts 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));