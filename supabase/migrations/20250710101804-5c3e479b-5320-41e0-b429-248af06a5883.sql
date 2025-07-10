-- Lägg till starttid-fält i course_templates tabellen
ALTER TABLE public.course_templates 
ADD COLUMN start_time time without time zone DEFAULT '18:00'::time;

-- Lägg till starttid-fält i course_instances tabellen  
ALTER TABLE public.course_instances 
ADD COLUMN start_time time without time zone DEFAULT '18:00'::time;

-- Uppdatera trigge för uppdatering av updated_at kolumner
CREATE TRIGGER update_course_templates_updated_at
BEFORE UPDATE ON public.course_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();