-- Comprehensive RLS policy updates to include superadmin role
-- This will ensure superadmin can see all data including sent emails

-- Update sent_emails policies
DROP POLICY IF EXISTS "Admins can view all sent emails" ON public.sent_emails;
DROP POLICY IF EXISTS "Admins can delete sent emails" ON public.sent_emails;

CREATE POLICY "Admins and superadmins can view all sent emails" 
ON public.sent_emails 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can delete sent emails" 
ON public.sent_emails 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update email_contacts policies
DROP POLICY IF EXISTS "Admins can manage email contacts" ON public.email_contacts;

CREATE POLICY "Admins and superadmins can manage email contacts" 
ON public.email_contacts 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update email_groups policies
DROP POLICY IF EXISTS "Admins can manage email groups" ON public.email_groups;

CREATE POLICY "Admins and superadmins can manage email groups" 
ON public.email_groups 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update email_group_members policies
DROP POLICY IF EXISTS "Admins can manage email group members" ON public.email_group_members;

CREATE POLICY "Admins and superadmins can manage email group members" 
ON public.email_group_members 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update email_templates policies
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

CREATE POLICY "Admins and superadmins can manage email templates" 
ON public.email_templates 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update discount_codes policies
DROP POLICY IF EXISTS "Admins can manage discount codes" ON public.discount_codes;

CREATE POLICY "Admins and superadmins can manage discount codes" 
ON public.discount_codes 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update inquiries policies
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;

CREATE POLICY "Admins and superadmins can view all inquiries" 
ON public.inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update course_bookings policies
DROP POLICY IF EXISTS "Admins can view all course bookings" ON public.course_bookings;

CREATE POLICY "Admins and superadmins can view all course bookings" 
ON public.course_bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update course_purchases policies
DROP POLICY IF EXISTS "Admins can view all course purchases" ON public.course_purchases;

CREATE POLICY "Admins and superadmins can view all course purchases" 
ON public.course_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update course_waitlist policies
DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "Admins can update waitlist entries" ON public.course_waitlist;
DROP POLICY IF EXISTS "View waitlist entries" ON public.course_waitlist;

CREATE POLICY "Admins and superadmins can delete waitlist entries" 
ON public.course_waitlist 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update waitlist entries" 
ON public.course_waitlist 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can view waitlist entries" 
ON public.course_waitlist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update ticket_purchases policies
DROP POLICY IF EXISTS "Admins can view all ticket purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins can delete ticket purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Admins can update ticket contact details" ON public.ticket_purchases;

CREATE POLICY "Admins and superadmins can view all ticket purchases" 
ON public.ticket_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can delete ticket purchases" 
ON public.ticket_purchases 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update ticket contact details" 
ON public.ticket_purchases 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update security_audit_log policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;

CREATE POLICY "Admins and superadmins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update actors policies (keep the is_active logic for public, expand admin access)
DROP POLICY IF EXISTS "Admins can delete actors" ON public.actors;
DROP POLICY IF EXISTS "Admins can insert actors" ON public.actors;
DROP POLICY IF EXISTS "Admins can update actors" ON public.actors;
DROP POLICY IF EXISTS "View actors" ON public.actors;

CREATE POLICY "Admins and superadmins can delete actors" 
ON public.actors 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert actors" 
ON public.actors 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update actors" 
ON public.actors 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View actors" 
ON public.actors 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update performers policies
DROP POLICY IF EXISTS "Admins can delete performers" ON public.performers;
DROP POLICY IF EXISTS "Admins can insert performers" ON public.performers;
DROP POLICY IF EXISTS "Admins can update performers" ON public.performers;
DROP POLICY IF EXISTS "View performers" ON public.performers;

CREATE POLICY "Admins and superadmins can delete performers" 
ON public.performers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert performers" 
ON public.performers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update performers" 
ON public.performers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View performers" 
ON public.performers 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update venues policies
DROP POLICY IF EXISTS "Admins can delete venues" ON public.venues;
DROP POLICY IF EXISTS "Admins can insert venues" ON public.venues;
DROP POLICY IF EXISTS "Admins can update venues" ON public.venues;
DROP POLICY IF EXISTS "View venues" ON public.venues;

CREATE POLICY "Admins and superadmins can delete venues" 
ON public.venues 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert venues" 
ON public.venues 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update venues" 
ON public.venues 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View venues" 
ON public.venues 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update show_tags policies
DROP POLICY IF EXISTS "Admins can delete show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Admins can insert show tags" ON public.show_tags;
DROP POLICY IF EXISTS "Admins can update show tags" ON public.show_tags;
DROP POLICY IF EXISTS "View show tags" ON public.show_tags;

CREATE POLICY "Admins and superadmins can delete show tags" 
ON public.show_tags 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert show tags" 
ON public.show_tags 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update show tags" 
ON public.show_tags 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View show tags" 
ON public.show_tags 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update interest_signups policies
DROP POLICY IF EXISTS "Admins can delete interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "Admins can insert interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "Admins can update interest signups" ON public.interest_signups;
DROP POLICY IF EXISTS "View interest signups" ON public.interest_signups;

CREATE POLICY "Admins and superadmins can delete interest signups" 
ON public.interest_signups 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert interest signups" 
ON public.interest_signups 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update interest signups" 
ON public.interest_signups 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View interest signups" 
ON public.interest_signups 
FOR SELECT 
USING (is_visible = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update interest_signup_submissions policies
DROP POLICY IF EXISTS "Admins can delete interest signup submissions" ON public.interest_signup_submissions;
DROP POLICY IF EXISTS "Admins can view interest signup submissions" ON public.interest_signup_submissions;

CREATE POLICY "Admins and superadmins can delete interest signup submissions" 
ON public.interest_signup_submissions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can view interest signup submissions" 
ON public.interest_signup_submissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update show_templates policies
DROP POLICY IF EXISTS "Admins can manage show templates" ON public.show_templates;

CREATE POLICY "Admins and superadmins can manage show templates" 
ON public.show_templates 
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update admin_shows policies
DROP POLICY IF EXISTS "Admins can delete shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins can insert shows" ON public.admin_shows;
DROP POLICY IF EXISTS "Admins can update shows" ON public.admin_shows;
DROP POLICY IF EXISTS "View shows" ON public.admin_shows;

CREATE POLICY "Admins and superadmins can delete shows" 
ON public.admin_shows 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert shows" 
ON public.admin_shows 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update shows" 
ON public.admin_shows 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View shows" 
ON public.admin_shows 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update show_performers policies
DROP POLICY IF EXISTS "Admins can delete show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Admins can insert show performers" ON public.show_performers;
DROP POLICY IF EXISTS "Admins can update show performers" ON public.show_performers;

CREATE POLICY "Admins and superadmins can delete show performers" 
ON public.show_performers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can insert show performers" 
ON public.show_performers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can update show performers" 
ON public.show_performers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update course_instances policies
DROP POLICY IF EXISTS "Admins can delete course instances" ON public.course_instances;
DROP POLICY IF EXISTS "Admins can manage course instances" ON public.course_instances;
DROP POLICY IF EXISTS "View course instances" ON public.course_instances;

CREATE POLICY "Admins and superadmins can delete course instances" 
ON public.course_instances 
FOR DELETE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins and superadmins can manage course instances" 
ON public.course_instances 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View course instances" 
ON public.course_instances 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

-- Update course_offers policies (keep complex conditions but expand admin access)
DROP POLICY IF EXISTS "Admins can create course offers" ON public.course_offers;
DROP POLICY IF EXISTS "View course offers" ON public.course_offers;

CREATE POLICY "Admins and superadmins can create course offers" 
ON public.course_offers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin'));

CREATE POLICY "View course offers" 
ON public.course_offers 
FOR SELECT 
USING ((has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin')) OR (status = 'sent' AND expires_at > now()));