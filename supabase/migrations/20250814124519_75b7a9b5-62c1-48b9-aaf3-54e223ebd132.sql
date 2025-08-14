-- Enable realtime for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE admin_shows;
ALTER PUBLICATION supabase_realtime ADD TABLE course_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE course_purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE performers;
ALTER PUBLICATION supabase_realtime ADD TABLE actors;
ALTER PUBLICATION supabase_realtime ADD TABLE interest_signups;
ALTER PUBLICATION supabase_realtime ADD TABLE interest_signup_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE email_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE sent_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE user_roles;

-- Set replica identity for proper real-time updates
ALTER TABLE admin_shows REPLICA IDENTITY FULL;
ALTER TABLE course_instances REPLICA IDENTITY FULL;
ALTER TABLE ticket_purchases REPLICA IDENTITY FULL;
ALTER TABLE course_purchases REPLICA IDENTITY FULL;
ALTER TABLE performers REPLICA IDENTITY FULL;
ALTER TABLE actors REPLICA IDENTITY FULL;
ALTER TABLE interest_signups REPLICA IDENTITY FULL;
ALTER TABLE interest_signup_submissions REPLICA IDENTITY FULL;
ALTER TABLE email_templates REPLICA IDENTITY FULL;
ALTER TABLE email_contacts REPLICA IDENTITY FULL;
ALTER TABLE sent_emails REPLICA IDENTITY FULL;
ALTER TABLE user_roles REPLICA IDENTITY FULL;