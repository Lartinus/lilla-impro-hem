-- Add sample interest signups based on the provided examples
INSERT INTO public.interest_signups (title, subtitle, information, is_visible, sort_order) VALUES 
(
  'House Teams & fortsättning',
  'Auditions hålls regelbundet',
  'Efter Nivå 2 kan du söka till ett av våra House Teams — ensembler som spelar tillsammans under en längre tid. Här fortsätter du utvecklas i grupp med stöd av coach och får spela regelbundet inför publik. Målet är att växa både som grupp och individ — och lära sig skapa hela föreställningar tillsammans. Antagning sker efter nivå, gruppkemi och vilja att utvecklas.',
  true,
  1
),
(
  'Helgworkshops & specialkurser',
  'Med oss och inbjudna gästpedagoger',
  'Utöver våra nivåbaserade kurser erbjuder vi workshops med oss och inbjudna gästpedagoger. Här kan du fördjupa dig i format, tekniker och tematiska områden — från karaktärsarbete och space work till musikal, sketch eller storytelling.',
  true,
  2
);