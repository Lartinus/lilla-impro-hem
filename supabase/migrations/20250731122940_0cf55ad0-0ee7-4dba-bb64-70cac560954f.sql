-- Create course purchases table to track paid course bookings
CREATE TABLE public.course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_instance_id UUID NOT NULL,
  course_title TEXT NOT NULL,
  course_table_name TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_address TEXT,
  buyer_postal_code TEXT,
  buyer_city TEXT,
  buyer_message TEXT,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all course purchases" 
ON public.course_purchases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can insert course purchases" 
ON public.course_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Can update payment status" 
ON public.course_purchases 
FOR UPDATE 
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_course_purchases_updated_at
BEFORE UPDATE ON public.course_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to course_instances
ALTER TABLE public.course_purchases 
ADD CONSTRAINT fk_course_purchases_course_instance 
FOREIGN KEY (course_instance_id) REFERENCES public.course_instances(id) ON DELETE CASCADE;