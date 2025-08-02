-- Add automatic email templates for inquiries
INSERT INTO public.email_templates (name, subject, content, description, is_active) VALUES 
(
  'AUTO: Företagsförfrågan bekräftelse',
  'Bekräftelse av företagsförfrågan',
  'H1: Tack för din förfrågan!

Hej {NAMN}!

Vi har tagit emot din företagsförfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.

H2: Dina uppgifter

Företag: {FÖRETAG}
Tillfälle: {TILLFÄLLE}

Vi ser fram emot att skapa något fantastiskt för er organisation!

H2: Kontakta oss

Har du frågor? Kontakta oss på kontakt@improteatern.se eller besök improteatern.se

Med vänliga hälsningar
Lilla Improteatern',
  'Skickas när någon gör en företagsförfrågan',
  true
),
(
  'AUTO: Privatförfrågan bekräftelse', 
  'Bekräftelse av förfrågan',
  'H1: Tack för din förfrågan!

Hej {NAMN}!

Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.

H2: Ditt tillfälle

Tillfälle: {TILLFÄLLE}

Vi ser fram emot att göra ert tillfälle extra speciellt!

H2: Kontakta oss

Har du frågor? Kontakta oss på kontakt@improteatern.se eller besök improteatern.se

Med vänliga hälsningar
Lilla Improteatern',
  'Skickas när någon gör en privatförfrågan',
  true
);