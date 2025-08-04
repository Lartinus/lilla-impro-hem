-- Add missing foreign key indexes for better performance

-- Index for admin_shows.tag_id foreign key
CREATE INDEX IF NOT EXISTS idx_admin_shows_tag_id ON public.admin_shows(tag_id);

-- Index for course_purchases.course_instance_id foreign key  
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_instance_id ON public.course_purchases(course_instance_id);

-- Index for email_group_members.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_email_group_members_contact_id ON public.email_group_members(contact_id);

-- Index for interest_signup_submissions.interest_signup_id foreign key
CREATE INDEX IF NOT EXISTS idx_interest_signup_submissions_interest_signup_id ON public.interest_signup_submissions(interest_signup_id);

-- Index for show_performers.actor_id foreign key
CREATE INDEX IF NOT EXISTS idx_show_performers_actor_id ON public.show_performers(actor_id);