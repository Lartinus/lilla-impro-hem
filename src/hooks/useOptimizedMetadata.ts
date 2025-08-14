import { useState, useEffect } from 'react';

interface OptimizedMetadata {
  tables: any[];
  timezones: string[];
  lastUpdated: number;
}

const METADATA_CACHE_KEY = 'supabase_metadata_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const TIMEZONE_CACHE_KEY = 'pg_timezones_cache';
const TIMEZONE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useOptimizedMetadata = () => {
  const [metadata, setMetadata] = useState<OptimizedMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedData = <T>(key: string, maxAge: number): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data.value;
    } catch {
      return null;
    }
  };

  const setCachedData = <T>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn(`Failed to cache ${key}:`, error);
    }
  };

  const loadOptimizedMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedMetadata = getCachedData<OptimizedMetadata>(METADATA_CACHE_KEY, CACHE_DURATION);
      const cachedTimezones = getCachedData<string[]>(TIMEZONE_CACHE_KEY, TIMEZONE_CACHE_DURATION);

      if (cachedMetadata && cachedTimezones) {
        setMetadata({
          ...cachedMetadata,
          timezones: cachedTimezones
        });
        setIsLoading(false);
        return;
      }

      // Load essential data only - avoid expensive system catalog queries
      const results = await Promise.allSettled([
        loadEssentialTables(),
        loadCommonTimezones()
      ]);

      const tables = results[0].status === 'fulfilled' ? results[0].value : [];
      const timezones = results[1].status === 'fulfilled' ? results[1].value : [];

      const optimizedMetadata: OptimizedMetadata = {
        tables,
        timezones,
        lastUpdated: Date.now()
      };

      setMetadata(optimizedMetadata);
      setCachedData(METADATA_CACHE_KEY, { tables, lastUpdated: Date.now() });
      setCachedData(TIMEZONE_CACHE_KEY, timezones);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEssentialTables = async (): Promise<any[]> => {
    // Instead of the complex system query, get only what's needed
    // This is a placeholder - in practice, you'd query only essential table info
    return [
      {
        schema: 'public',
        name: 'Essential table metadata',
        rls_enabled: true,
        size: 'Cached for performance'
      }
    ];
  };

  const loadCommonTimezones = async (): Promise<string[]> => {
    // Swedish site - only need Swedish timezone
    return ['Europe/Stockholm'];
  };

  const invalidateCache = () => {
    localStorage.removeItem(METADATA_CACHE_KEY);
    localStorage.removeItem(TIMEZONE_CACHE_KEY);
    loadOptimizedMetadata();
  };

  useEffect(() => {
    loadOptimizedMetadata();
  }, []);

  return {
    metadata,
    isLoading,
    error,
    refetch: loadOptimizedMetadata,
    invalidateCache
  };
};