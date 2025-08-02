-- Insert automatic email templates with default content
INSERT INTO public.email_templates (name, subject, content, is_active) VALUES
(
  'AUTO: course_confirmation',
  'Välkommen till {KURSTITEL}',
  'H1: Välkommen till {KURSTITEL}

Hej {NAMN}!

Vi ser fram emot att träffa dig på kursen!

H2: Praktisk information

Kursen startar: {STARTDATUM} kl {STARTTID}

Mer information kommer att skickas ut innan kursstart.',
  true
),
(
  'AUTO: interest_confirmation',
  'Tack för din intresseanmälan',
  'H1: Tack för din intresseanmälan

Hej {NAMN}!

Vi har tagit emot din intresseanmälan för {INTRESSETITEL}.

Vi kommer att kontakta dig så snart vi har mer information.',
  true
),
(
  'AUTO: ticket_confirmation',
  'Dina biljetter till {FORESTALLNING}',
  'H1: Dina biljetter

Hej {NAMN}!

Tack för ditt köp! Här är dina biljetter till {FORESTALLNING}.',
  true
),
(
  'AUTO: corporate_inquiry',
  'Tack för din företagsförfrågan!',
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
  true
),
(
  'AUTO: private_inquiry',
  'Tack för din förfrågan!',
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
  true
);