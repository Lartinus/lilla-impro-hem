-- Update existing course instance titles from old legacy names to new canonical names only
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
