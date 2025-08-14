import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CachedFunction {
  id: string;
  name: string;
  schema: string;
  definition: string;
  cached_at: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'supabase_functions_cache';

export const useCachedFunctions = () => {
  const [functions, setFunctions] = useState<CachedFunction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = (): CachedFunction[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data.functions;
    } catch {
      return null;
    }
  };

  const setCachedData = (functions: CachedFunction[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        functions,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache functions:', error);
    }
  };

  const fetchFunctions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setFunctions(cachedData);
        setIsLoading(false);
        return;
      }

      // Since we can't modify system catalogs, minimize function metadata queries
      // Only fetch what's absolutely necessary and cache aggressively
      const { data, error: fetchError } = await supabase
        .from('user_roles') // Use a simple query as placeholder
        .select('*')
        .limit(1);
      
      if (fetchError) {
        throw fetchError;
      }

      // For now, return minimal cached data to demonstrate the pattern
      const functionsWithCache: CachedFunction[] = [
        {
          id: 'cached',
          name: 'Cached Functions',
          schema: 'public',
          definition: 'Function metadata cached to improve performance',
          cached_at: Date.now()
        }
      ];

      setFunctions(functionsWithCache);
      setCachedData(functionsWithCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch functions');
    } finally {
      setIsLoading(false);
    }
  };

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
    fetchFunctions();
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  return {
    functions,
    isLoading,
    error,
    refetch: fetchFunctions,
    invalidateCache
  };
};