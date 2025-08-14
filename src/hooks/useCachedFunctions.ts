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

      // Fetch only essential function metadata - avoid the complex query
      const { data, error: fetchError } = await supabase.rpc('get_simplified_functions');
      
      if (fetchError) {
        throw fetchError;
      }

      const functionsWithCache = (data || []).map((fn: any) => ({
        ...fn,
        cached_at: Date.now()
      }));

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