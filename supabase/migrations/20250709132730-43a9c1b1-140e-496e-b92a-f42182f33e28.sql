-- Skapa tabell för kursmallar
CREATE TABLE public.course_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  subtitle TEXT,
  course_info TEXT,
  practical_info TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 12,
  sessions INTEGER NOT NULL DEFAULT 8,
  hours_per_session DECIMAL NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Aktivera RLS
ALTER TABLE public.course_templates ENABLE ROW LEVEL SECURITY;

-- Skapa policies för admins
CREATE POLICY "Admins can manage course templates"
ON public.course_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Skapa trigger för updated_at
CREATE TRIGGER update_course_templates_updated_at
BEFORE UPDATE ON public.course_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Lägg till standardmallar
INSERT INTO public.course_templates (name, title_template, subtitle, course_info, practical_info, price, discount_price, max_participants, sessions, hours_per_session, is_active) VALUES
('Nivå 1', 'Niv 1 - Scenarbete & Improv Comedy', 'Grundkurs i improvisationsteater', 'En introduktionskurs för nybörjare inom improvisationsteater.', 'Ta med bekväma kläder och vara beredd att ha kul!', 2400, 1800, 12, 8, 2, true),
('Nivå 2', 'Niv 2 - Långform & Improviserad komik', 'Fördjupningskurs i improvisationsteater', 'En fortsättningskurs för dig som redan har grundläggande kunskaper.', 'Kräver tidigare erfarenhet av improvisationsteater.', 2800, 2100, 10, 8, 2.5, true),
('House Team', 'House Team', 'Regelbunden träning för erfarna improvisatörer', 'Kontinuerlig träning och utveckling för medlemmar i LIT:s house team.', 'Endast för inbjudna medlemmar.', 1500, 1200, 8, 12, 2, true),
('Helgworkshop', 'Helgworkshop', 'Intensiv workshop under en helg', 'En koncentrerad workshop som sträcker sig över en helg.', 'Fredag kväll, lördag och söndag.', 1800, 1400, 15, 3, 4, true);