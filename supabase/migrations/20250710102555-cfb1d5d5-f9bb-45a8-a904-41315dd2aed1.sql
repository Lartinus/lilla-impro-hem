-- Lägg till starttid-fält i course_templates tabellen
ALTER TABLE public.course_templates 
ADD COLUMN start_time time without time zone DEFAULT '18:00'::time;

-- Lägg till starttid-fält i course_instances tabellen  
ALTER TABLE public.course_instances 
ADD COLUMN start_time time without time zone DEFAULT '18:00'::time;