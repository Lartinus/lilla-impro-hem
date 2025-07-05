-- Create table for email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL, 
  content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates
INSERT INTO public.email_templates (name, subject, content, description) VALUES 
(
  'Välkomstmejl',
  'Välkommen till [KURSNAMN]!',
  'Hej [NAMN]!

Välkommen till kursen [KURSNAMN]. Vi ser fram emot att träffa dig!

Med vänliga hälsningar,
LIT-teamet',
  'Standardmejl för att välkomna nya kursdeltagare'
),
(
  'Kursbekräftelse',
  'Bekräftelse: Du är anmäld till [KURSNAMN]',
  'Hej [NAMN]!

Tack för din anmälan till [KURSNAMN]!

Kursstart: [DATUM]
Tid: [TID]
Plats: [PLATS]

Vi kommer att höra av oss med mer information närmare kursstart.

Med vänliga hälsningar,
LIT-teamet',
  'Bekräftelsemejl när någon anmäler sig till en kurs'
),
(
  'Föreställningspåminnelse',
  'Imorgon är det dags - [FÖRESTÄLLNING]!',
  'Hej [NAMN]!

Imorgon är det dags för [FÖRESTÄLLNING]!

- Tid: [TID]
- Plats: [PLATS]
- Adress: [ADRESS]

Vi ser fram emot att träffa dig!

LIT-teamet',
  'Påminnelse inför föreställning'
);