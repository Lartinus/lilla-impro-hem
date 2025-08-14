-- Fix remaining RLS performance issues by optimizing auth function calls
-- Replace direct auth.uid() calls with (select auth.uid()) subqueries

-- Drop existing policies with performance issues
DROP POLICY IF EXISTS "course_niv__1____improv_comedy_1754424437748_admin_delete" ON public.course_niv__1____improv_comedy_1754424437748;
DROP POLICY IF EXISTS "course_niv__1____improv_comedy_1754424437748_admin_read" ON public.course_niv__1____improv_comedy_1754424437748;
DROP POLICY IF EXISTS "course_niv__1____improv_comedy_1754424437748_admin_update" ON public.course_niv__1____improv_comedy_1754424437748;

DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754818557979_admin_delete" ON public.course_niv__2___improv_comedy_1754818557979;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754818557979_admin_read" ON public.course_niv__2___improv_comedy_1754818557979;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754818557979_admin_update" ON public.course_niv__2___improv_comedy_1754818557979;

DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754920621478_admin_delete" ON public.course_niv__2___improv_comedy_1754920621478;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754920621478_admin_read" ON public.course_niv__2___improv_comedy_1754920621478;
DROP POLICY IF EXISTS "course_niv__2___improv_comedy_1754920621478_admin_update" ON public.course_niv__2___improv_comedy_1754920621478;

DROP POLICY IF EXISTS "Admins and superadmins can manage show templates" ON public.show_templates;
DROP POLICY IF EXISTS "Admins and superadmins can view audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins and superadmins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Admins and superadmins can manage email group members" ON public.email_group_members;
DROP POLICY IF EXISTS "Admins and superadmins can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Admins and superadmins can delete sent emails" ON public.sent_emails;
DROP POLICY IF EXISTS "Admins and superadmins can view all sent emails" ON public.sent_emails;
DROP POLICY IF EXISTS "Admins and superadmins can delete show tags relations" ON public.admin_show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can insert show tags relations" ON public.admin_show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can update show tags relations" ON public.admin_show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can delete show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can insert show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can update show tags" ON public.show_tags;
DROP POLICY IF EXISTS "View show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Admins and superadmins can delete waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Admins and superadmins can update waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Admins and superadmins can view waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Admins and superadmins can view all course purchases" ON public.course_purchases;
DROP POLICY IF EXISTS "admin_delete" ON public.course_purchases;
DROP POLICY IF EXISTS "admin_update" ON public.course_purchases;
DROP POLICY IF EXISTS "Admins and superadmins can create course offers" ON public.course_offers;
DROP POLICY IF EXISTS "Admins and superadmins can view course offers" ON public.course_offers;
DROP POLICY IF EXISTS "admin_delete" ON public.course_offers;
DROP POLICY IF EXISTS "admin_update" ON public.course_offers;
DROP POLICY IF EXISTS "Admins and superadmins can manage course templates" ON public.course_templates;
DROP POLICY IF EXISTS "admin_delete" ON public.course_templates;
DROP POLICY IF EXISTS "admin_read" ON public.course_templates;
DROP POLICY IF EXISTS "admin_update" ON public.course_templates;

-- Recreate policies with optimized auth function calls

-- Dynamic course tables
CREATE POLICY "course_niv__1____improv_comedy_1754424437748_admin_delete" 
ON public.course_niv__1____improv_comedy_1754424437748 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_niv__1____improv_comedy_1754424437748_admin_read" 
ON public.course_niv__1____improv_comedy_1754424437748 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_niv__1____improv_comedy_1754424437748_admin_update" 
ON public.course_niv__1____improv_comedy_1754424437748 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_niv__2___improv_comedy_1754818557979_admin_delete" 
ON public.course_niv__2___improv_comedy_1754818557979 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy_1754818557979_admin_read" 
ON public.course_niv__2___improv_comedy_1754818557979 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy_1754818557979_admin_update" 
ON public.course_niv__2___improv_comedy_1754818557979 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy_1754920621478_admin_delete" 
ON public.course_niv__2___improv_comedy_1754920621478 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy_1754920621478_admin_read" 
ON public.course_niv__2___improv_comedy_1754920621478 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "course_niv__2___improv_comedy_1754920621478_admin_update" 
ON public.course_niv__2___improv_comedy_1754920621478 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'));

-- show_templates
CREATE POLICY "Admins and superadmins can manage show templates" 
ON public.show_templates 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- security_audit_log
CREATE POLICY "Admins and superadmins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- settings
CREATE POLICY "Admins and superadmins can manage settings" 
ON public.settings 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- email_group_members
CREATE POLICY "Admins and superadmins can manage email group members" 
ON public.email_group_members 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- email_templates
CREATE POLICY "Admins and superadmins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- sent_emails
CREATE POLICY "Admins and superadmins can delete sent emails" 
ON public.sent_emails 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view all sent emails" 
ON public.sent_emails 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- admin_show_tags
CREATE POLICY "Admins and superadmins can delete show tags relations" 
ON public.admin_show_tags 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert show tags relations" 
ON public.admin_show_tags 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update show tags relations" 
ON public.admin_show_tags 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- show_tags
CREATE POLICY "Admins and superadmins can delete show tags" 
ON public.show_tags 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert show tags" 
ON public.show_tags 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update show tags" 
ON public.show_tags 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "View show tags" 
ON public.show_tags 
FOR SELECT 
USING ((is_active = true) OR has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- course_waitlist
CREATE POLICY "Admins and superadmins can delete waitlist entries" 
ON public.course_waitlist 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can update waitlist entries" 
ON public.course_waitlist 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- course_purchases
CREATE POLICY "Admins and superadmins can view all course purchases" 
ON public.course_purchases 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "admin_delete" 
ON public.course_purchases 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "admin_update" 
ON public.course_purchases 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'));

-- course_offers
CREATE POLICY "Admins and superadmins can create course offers" 
ON public.course_offers 
FOR INSERT 
WITH CHECK (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "Admins and superadmins can view course offers" 
ON public.course_offers 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

CREATE POLICY "admin_delete" 
ON public.course_offers 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY "admin_update" 
ON public.course_offers 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'));

-- course_templates (consolidate into single policy to fix multiple permissive policies issue)
CREATE POLICY "Admins can manage course templates" 
ON public.course_templates 
FOR ALL 
USING (has_role((SELECT auth.uid()), 'admin') OR has_role((SELECT auth.uid()), 'superadmin'));

-- Also fix the course_niv_1_scenarbete_improv_comedy_1749454350362 table (missed earlier)
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_delet" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_read" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;
DROP POLICY IF EXISTS "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_updat" ON public.course_niv_1_scenarbete_improv_comedy_1749454350362;

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_delete" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_read" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_niv_1_scenarbete_improv_comedy_1749454350362_admin_update" 
ON public.course_niv_1_scenarbete_improv_comedy_1749454350362 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Also fix course_improboost__1752182394475 table
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_delete" ON public.course_improboost__1752182394475;
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_read" ON public.course_improboost__1752182394475;
DROP POLICY IF EXISTS "course_improboost__1752182394475_admin_update" ON public.course_improboost__1752182394475;

CREATE POLICY "course_improboost__1752182394475_admin_delete" 
ON public.course_improboost__1752182394475 
FOR DELETE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_improboost__1752182394475_admin_read" 
ON public.course_improboost__1752182394475 
FOR SELECT 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "course_improboost__1752182394475_admin_update" 
ON public.course_improboost__1752182394475 
FOR UPDATE 
USING (has_role((SELECT auth.uid()), 'admin'::app_role));