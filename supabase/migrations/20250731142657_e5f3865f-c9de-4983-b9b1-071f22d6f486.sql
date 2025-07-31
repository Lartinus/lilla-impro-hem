-- Create default automatic email templates for the AutomaticEmailsManager system
-- First check if they already exist, then insert only if they don't

-- Course confirmation template
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'AUTO: Kursbekräftelse') THEN
    INSERT INTO public.email_templates (name, subject, content, description, is_active)
    VALUES (
      'AUTO: Kursbekräftelse',
      'Välkommen till {KURSTITEL}',
      'H1: Välkommen till {KURSTITEL}

Hej {NAMN}!

Vi ser fram emot att träffa dig på kursen!

H2: Praktisk information

Kursen startar: {STARTDATUM} kl {STARTTID}

Mer information kommer att skickas ut innan kursstart.',
      'Automatisk bekräftelse som skickas när någon bokar en kurs',
      true
    );
  END IF;
END
$$;

-- Interest signup confirmation template
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'AUTO: Intresseanmälan bekräftelse') THEN
    INSERT INTO public.email_templates (name, subject, content, description, is_active)
    VALUES (
      'AUTO: Intresseanmälan bekräftelse',
      'Tack för din intresseanmälan',
      'H1: Tack för din intresseanmälan

Hej {NAMN}!

Vi har tagit emot din intresseanmälan för {INTRESSETITEL}.

Vi kommer att kontakta dig så snart vi har mer information.',
      'Automatisk bekräftelse som skickas när någon anmäler intresse',
      true
    );
  END IF;
END
$$;

-- Ticket confirmation template  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'AUTO: Biljettbekräftelse') THEN
    INSERT INTO public.email_templates (name, subject, content, description, is_active)
    VALUES (
      'AUTO: Biljettbekräftelse',
      'Dina biljetter till {FORESTALLNING}',
      'H1: Dina biljetter

Hej {NAMN}!

Tack för ditt köp! Här är dina biljetter till {FORESTALLNING} den {DATUM}.

Biljettkod: {BILJETTKOD}',
      'Automatisk bekräftelse som skickas när någon köper biljetter',
      true
    );
  END IF;
END
$$;