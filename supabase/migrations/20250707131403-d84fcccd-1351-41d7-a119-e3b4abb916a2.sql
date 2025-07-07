-- Lägg till kolumner för två kursledare i course_instances tabellen
ALTER TABLE public.course_instances 
ADD COLUMN instructor_id_1 UUID REFERENCES public.performers(id),
ADD COLUMN instructor_id_2 UUID REFERENCES public.performers(id);

-- Skapa index för bättre prestanda
CREATE INDEX idx_course_instances_instructor_1 ON public.course_instances(instructor_id_1);
CREATE INDEX idx_course_instances_instructor_2 ON public.course_instances(instructor_id_2);

-- Kommentar: Vi behåller instructor kolumnen för bakåtkompatibilitet men kommer att använda de nya kolumnerna