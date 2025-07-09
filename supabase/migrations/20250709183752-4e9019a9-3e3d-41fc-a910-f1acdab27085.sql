-- Make sure there's a "Nyhetsbrevet" group for newsletter confirmations
INSERT INTO public.email_groups (name, description, is_active) 
VALUES ('Nyhetsbrevet', 'Alla som prenumererar på vårt nyhetsbrev', true)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;