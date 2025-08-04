-- Fix RLS performance issues by using (select auth.uid()) instead of auth.uid()
-- This prevents re-evaluation for each row

-- Fix sent_emails policies (the new table we just created)
DROP POLICY IF EXISTS "Admins can view all sent emails" ON public.sent_emails;
CREATE POLICY "Admins can view all sent emails" 
ON public.sent_emails 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS "Admins can delete sent emails" ON public.sent_emails;
CREATE POLICY "Admins can delete sent emails" 
ON public.sent_emails 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix admin_shows policies
DROP POLICY IF EXISTS "Admins can manage shows" ON public.admin_shows;
CREATE POLICY "Admins can manage shows" 
ON public.admin_shows 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix email_templates policies
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix email_groups policies
DROP POLICY IF EXISTS "Admins can manage email groups" ON public.email_groups;
CREATE POLICY "Admins can manage email groups" 
ON public.email_groups 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix email_contacts policies
DROP POLICY IF EXISTS "Admins can manage email contacts" ON public.email_contacts;
CREATE POLICY "Admins can manage email contacts" 
ON public.email_contacts 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix email_group_members policies
DROP POLICY IF EXISTS "Admins can manage email group members" ON public.email_group_members;
CREATE POLICY "Admins can manage email group members" 
ON public.email_group_members 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix show_tags policies
DROP POLICY IF EXISTS "Admins can manage show tags" ON public.show_tags;
CREATE POLICY "Admins can manage show tags" 
ON public.show_tags 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix discount_codes policies
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;
CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix venues policies
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
CREATE POLICY "Admins can manage venues" 
ON public.venues 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix performers policies
DROP POLICY IF EXISTS "Admins can manage performers" ON public.performers;
CREATE POLICY "Admins can manage performers" 
ON public.performers 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix actors policies (also fix multiple permissive policies issue)
DROP POLICY IF EXISTS "Admins can manage actors" ON public.actors;
DROP POLICY IF EXISTS "Anyone can view active actors" ON public.actors;
-- Create single optimized policy that handles both cases
CREATE POLICY "View and manage actors" 
ON public.actors 
FOR SELECT 
USING (is_active = true OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can modify actors" 
ON public.actors 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_templates policies
DROP POLICY IF EXISTS "Admins can manage course templates" ON public.course_templates;
CREATE POLICY "Admins can manage course templates" 
ON public.course_templates 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix show_templates policies
DROP POLICY IF EXISTS "Admins can manage show templates" ON public.show_templates;
CREATE POLICY "Admins can manage show templates" 
ON public.show_templates 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix interest_signups policies
DROP POLICY IF EXISTS "Admins can manage interest signups" ON public.interest_signups;
CREATE POLICY "Admins can manage interest signups" 
ON public.interest_signups 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix interest_signup_submissions policies
DROP POLICY IF EXISTS "Admins can view all interest signup submissions" ON public.interest_signup_submissions;
DROP POLICY IF EXISTS "Admins can delete interest signup submissions" ON public.interest_signup_submissions;
CREATE POLICY "Admins can view interest signup submissions" 
ON public.interest_signup_submissions 
FOR SELECT 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete interest signup submissions" 
ON public.interest_signup_submissions 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));

-- Fix course_waitlist policies
DROP POLICY IF EXISTS "Admins can view all waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Admins can manage waitlist entries" ON public.course_waitlist;
CREATE POLICY "Admins can manage waitlist entries" 
ON public.course_waitlist 
FOR ALL 
USING (has_role((select auth.uid()), 'admin'));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "View user roles" ON public.user_roles;

CREATE POLICY "View user roles" 
ON public.user_roles 
FOR SELECT 
USING (((select auth.uid()) = user_id) OR has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (current_user_is_admin() AND ((user_id <> (select auth.uid())) OR current_user_is_admin()));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role((select auth.uid()), 'admin'));