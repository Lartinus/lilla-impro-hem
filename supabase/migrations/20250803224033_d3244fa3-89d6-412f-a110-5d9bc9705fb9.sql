-- Add course offer template to email templates
INSERT INTO public.email_templates (name, subject, content, description, is_active)
VALUES (
  'AUTO: course_offer',
  'Du har erbjudits en plats i {KURSTITEL}!',
  'H1: Du har erbjudits en plats i kursen!

Hej {NAMN}!

Vi är glada att kunna erbjuda dig en plats i kursen "{KURSTITEL}".

H2: Kursinformation

- Kurs: {KURSTITEL}
- Ordinarie pris: {ORDINARIE_PRIS} kr
- Studentpris: {STUDENT_PRIS} kr

För att säkra din plats behöver du betala senast {GILTIGT_TILL}.

H2: Betala och säkra din plats

{BETALLANK}

Om du inte betalar inom tidsfristen kommer platsen att erbjudas till nästa person på väntelistan.

Har du frågor? Svara bara på detta mejl.

Välkommen!',
  'Automatisk mall för kurserbjudanden till personer på väntelista',
  true
)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  updated_at = now();

-- Add offer_sent column to course_waitlist to track who received offers
ALTER TABLE public.course_waitlist 
ADD COLUMN IF NOT EXISTS offer_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS offer_sent_at TIMESTAMP WITH TIME ZONE;

-- Add discount price options to course_offers
ALTER TABLE public.course_offers 
ADD COLUMN IF NOT EXISTS course_discount_price INTEGER DEFAULT 0;