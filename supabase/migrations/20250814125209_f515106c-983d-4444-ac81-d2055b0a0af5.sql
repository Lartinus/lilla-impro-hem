-- Fix RLS policy for ticket_bookings table
CREATE POLICY "Public can create ticket bookings"
ON public.ticket_bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view ticket bookings"
ON public.ticket_bookings
FOR SELECT
USING (has_role((SELECT auth.uid()), 'admin'::text) OR has_role((SELECT auth.uid()), 'superadmin'::text));

CREATE POLICY "Admins can update ticket bookings"
ON public.ticket_bookings
FOR UPDATE
USING (has_role((SELECT auth.uid()), 'admin'::text) OR has_role((SELECT auth.uid()), 'superadmin'::text));

CREATE POLICY "Admins can delete ticket bookings"
ON public.ticket_bookings
FOR DELETE
USING (has_role((SELECT auth.uid()), 'admin'::text) OR has_role((SELECT auth.uid()), 'superadmin'::text));

-- Fix performance issue in course_reservations policy by using SELECT
DROP POLICY IF EXISTS "Admins can view course reservations" ON public.course_reservations;

CREATE POLICY "Admins can view course reservations"
ON public.course_reservations
FOR SELECT
USING (has_role((SELECT auth.uid()), 'admin'::text) OR has_role((SELECT auth.uid()), 'superadmin'::text));

-- Add covering indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_admin_show_tags_tag_id ON public.admin_show_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_updated_by ON public.ticket_purchases(updated_by);