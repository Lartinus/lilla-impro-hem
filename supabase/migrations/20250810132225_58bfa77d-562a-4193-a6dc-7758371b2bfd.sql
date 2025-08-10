-- Update existing course instance titles from old legacy names to new canonical names
-- Nivå 1
UPDATE public.course_instances
SET course_title = 'Nivå 1 – Improv Comedy'
WHERE course_title IN (
  'Nivå 1 - Scenarbete & Improv Comedy',
  'Nivå 1 – Scenarbete & Improv Comedy',
  'Nivå 1 –  Improv Comedy',
  'Nivå 1 -  Improv Comedy'
);

-- Nivå 2
UPDATE public.course_instances
SET course_title = 'Nivå 2 – Improv Comedy'
WHERE course_title IN (
  'Nivå 2 - Långform improviserad komik',
  'Nivå 2 – Långform improviserad komik',
  'Nivå 2 –  Improv Comedy',
  'Nivå 2 -  Improv Comedy'
);

-- Optional: Also align any active course templates that might still carry old labels
-- Only update if they exactly match the known legacy values
UPDATE public.course_templates
SET title = 'Nivå 1 – Improv Comedy'
WHERE title IN (
  'Nivå 1 - Scenarbete & Improv Comedy',
  'Nivå 1 – Scenarbete & Improv Comedy'
);

UPDATE public.course_templates
SET title = 'Nivå 2 – Improv Comedy'
WHERE title IN (
  'Nivå 2 - Långform improviserad komik',
  'Nivå 2 – Långform improviserad komik'
);
