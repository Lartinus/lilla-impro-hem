-- Add email template for interest signups
INSERT INTO public.email_templates (name, subject, content, description, is_active)
VALUES (
  'Intresseanmälan bekräftelse - AUTO',
  'Tack för din intresseanmälan till [KURSNAMN]',
  'Hej [NAMN]!

Tack för att du har visat intresse för [KURSNAMN].

Vi har tagit emot din intresseanmälan och kommer att kontakta dig så snart vi har mer information om när kursen startar.

Du kommer att få prioritet när vi öppnar anmälan för denna kurs.

Har du några frågor är du välkommen att kontakta oss.

Med vänliga hälsningar,
Lilla Improteatern',
  'Automatisk bekräftelse för intresseanmälningar',
  true
);