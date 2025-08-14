-- Create a simplified function to get essential function metadata
-- This avoids the complex system catalog query
CREATE OR REPLACE FUNCTION public.get_simplified_functions()
RETURNS TABLE(
  id bigint,
  schema text,
  name text,
  language text,
  definition text,
  return_type text,
  is_security_definer boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only return functions from public schema to reduce dataset
  RETURN QUERY
  SELECT 
    p.oid::bigint as id,
    n.nspname as schema,
    p.proname as name,
    l.lanname as language,
    CASE 
      WHEN l.lanname = 'sql' THEN 'sql'
      ELSE substring(p.prosrc from 1 for 100) -- Limit definition length
    END as definition,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as is_security_definer
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  JOIN pg_language l ON p.prolang = l.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f' -- Only regular functions
  ORDER BY p.proname;
END;
$$;

-- Create index to optimize function lookups if not exists
CREATE INDEX IF NOT EXISTS idx_pg_proc_namespace_name 
ON pg_proc(pronamespace, proname) 
WHERE prokind = 'f';