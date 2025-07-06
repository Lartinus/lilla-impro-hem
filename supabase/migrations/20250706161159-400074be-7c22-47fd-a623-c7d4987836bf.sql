-- First, move all group members from duplicate groups to the latest group for each name
WITH latest_groups AS (
  SELECT DISTINCT ON (name) 
    id as latest_id, name
  FROM public.email_groups 
  WHERE name LIKE 'Intresse:%'
  ORDER BY name, created_at DESC
),
old_groups AS (
  SELECT eg.id as old_id, lg.latest_id, eg.name
  FROM public.email_groups eg
  JOIN latest_groups lg ON eg.name = lg.name
  WHERE eg.name LIKE 'Intresse:%' 
    AND eg.id != lg.latest_id
)
-- Move group members from old groups to latest groups
UPDATE public.email_group_members 
SET group_id = (
  SELECT latest_id 
  FROM old_groups 
  WHERE old_id = email_group_members.group_id
)
WHERE group_id IN (SELECT old_id FROM old_groups);

-- Now delete the duplicate groups (keep only the latest one for each name)
WITH latest_groups AS (
  SELECT DISTINCT ON (name) 
    id as latest_id, name
  FROM public.email_groups 
  WHERE name LIKE 'Intresse:%'
  ORDER BY name, created_at DESC
)
DELETE FROM public.email_groups 
WHERE name LIKE 'Intresse:%' 
  AND id NOT IN (SELECT latest_id FROM latest_groups);

-- Add unique constraint on email_groups name to prevent future duplicates
ALTER TABLE public.email_groups 
ADD CONSTRAINT email_groups_name_unique UNIQUE (name);