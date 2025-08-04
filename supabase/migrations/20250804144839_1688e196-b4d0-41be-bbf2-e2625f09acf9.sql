-- Create sent_emails table for logging all sent emails
CREATE TABLE public.sent_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  sender_email TEXT NOT NULL DEFAULT 'kontakt@improteatern.se',
  subject TEXT NOT NULL,
  content TEXT,
  html_content TEXT,
  email_type TEXT NOT NULL,
  source_function TEXT NOT NULL,
  resend_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view all sent emails" 
ON public.sent_emails 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sent emails" 
ON public.sent_emails 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Edge functions can insert sent email logs
CREATE POLICY "Edge functions can log sent emails" 
ON public.sent_emails 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_sent_emails_sent_at ON public.sent_emails(sent_at DESC);
CREATE INDEX idx_sent_emails_recipient ON public.sent_emails(recipient_email);
CREATE INDEX idx_sent_emails_type ON public.sent_emails(email_type);