-- Insert default newsletter confirmation email template
INSERT INTO public.email_templates (name, subject, content, background_image, description, is_active) 
VALUES (
  'AUTO: newsletter_confirmation',
  'Bekräfta din prenumeration på vårt nyhetsbrev',
  'Hej {NAMN}!

Tack för att du vill prenumerera på vårt nyhetsbrev!

För att bekräfta din prenumeration, klicka på länken nedan:
{BEKRÄFTELSELÄNK}

Vi ser fram emot att hålla dig uppdaterad om våra föreställningar och kurser!

Varma hälsningar,
Lilla Improteatern',
  '',
  'Mall för bekräftelse av nyhetsbrevsprenumeration',
  true
) ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;