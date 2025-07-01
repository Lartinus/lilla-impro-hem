
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Unified cache configuration with optimized settings
const UNIFIED_CACHE_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
  retry: 2, // Allow retries for better reliability
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

// localStorage keys for fallback data
const CACHE_KEYS = {
  COURSES: 'strapi_courses_cache',
  SHOWS: 'strapi_shows_cache',
  LAST_SYNC: 'last_sync_timestamp',
} as const;

// Performance monitoring utility
const measurePerformance = (operation: string) => {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`⏱️ ${operation} took ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};

// Enhanced cache utilities with error handling
const saveToCache = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: '1.0' // For future cache migrations
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`💾 Cached ${key} successfully`);
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

const getFromCache = (key: string, maxAge = 60 * 60 * 1000) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp, version } = JSON.parse(cached);
    
    // Check version compatibility
    if (version !== '1.0') {
      console.log(`🔄 Cache version mismatch for ${key}, invalidating`);
      localStorage.removeItem(key);
      return null;
    }
    
    const age = Date.now() - timestamp;
    if (age > maxAge) {
      console.log(`⏰ Cache expired for ${key} (${Math.round(age / 1000)}s old)`);
      return null;
    }
    
    console.log(`✅ Using cached ${key} (${Math.round(age / 1000)}s old)`);
    return data;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
};

// Enhanced courses query with performance monitoring
export const useOptimizedCourses = () => {
  return useQuery({
    queryKey: ['courses-optimized'],
    queryFn: async () => {
      const perf = measurePerformance('Courses fetch');
      
      try {
        console.log('🔄 Fetching courses with optimized strategy...');
        const { data, error } = await supabase.functions.invoke('strapi-courses');
        
        if (error) {
          console.error('❌ Strapi courses error:', error);
          const cachedData = getFromCache(CACHE_KEYS.COURSES);
          if (cachedData) {
            console.log('🔄 Using cached courses data as fallback');
            perf.end();
            return cachedData;
          }
          throw new Error(`Kurser kunde inte laddas: ${error.message}`);
        }
        
        // Handle API error responses
        if (data?.error) {
          console.error('❌ API returned error:', data.error);
          const cachedData = getFromCache(CACHE_KEYS.COURSES);
          if (cachedData) {
            console.log('🔄 Using cached data due to API error');
            perf.end();
            return cachedData;
          }
          throw new Error(data.error);
        }
        
        saveToCache(CACHE_KEYS.COURSES, data);
        console.log('✅ Successfully fetched and cached courses');
        perf.end();
        return data;
      } catch (error) {
        console.error('❌ Final error in courses fetch:', error);
        // Last resort: try stale cache
        const cachedData = getFromCache(CACHE_KEYS.COURSES, 24 * 60 * 60 * 1000);
        if (cachedData) {
          console.log('🔄 Using stale cached courses data as last resort');
          perf.end();
          return cachedData;
        }
        perf.end();
        throw error;
      }
    },
    ...UNIFIED_CACHE_CONFIG,
  });
};

// Enhanced shows query with performance monitoring
export const useOptimizedShows = () => {
  return useQuery({
    queryKey: ['shows-optimized'],
    queryFn: async () => {
      const perf = measurePerformance('Shows fetch');
      
      try {
        console.log('🔄 Fetching shows with optimized strategy...');
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        
        if (error) {
          console.error('❌ Strapi shows error:', error);
          const cachedData = getFromCache(CACHE_KEYS.SHOWS);
          if (cachedData) {
            console.log('🔄 Using cached shows data as fallback');
            perf.end();
            return cachedData;
          }
          throw error;
        }
        
        // Handle API error responses
        if (data?.error) {
          console.error('❌ Shows API returned error:', data.error);
          const cachedData = getFromCache(CACHE_KEYS.SHOWS);
          if (cachedData) {
            console.log('🔄 Using cached shows due to API error');
            perf.end();
            return cachedData;
          }
          throw new Error(data.error);
        }
        
        saveToCache(CACHE_KEYS.SHOWS, data);
        console.log('✅ Successfully fetched and cached shows');
        perf.end();
        return data;
      } catch (error) {
        console.error('❌ Final error in shows fetch:', error);
        const cachedData = getFromCache(CACHE_KEYS.SHOWS, 24 * 60 * 60 * 1000);
        if (cachedData) {
          console.log('🔄 Using stale cached shows data as last resort');
          perf.end();
          return cachedData;
        }
        perf.end();
        throw error;
      }
    },
    ...UNIFIED_CACHE_CONFIG,
  });
};

// Enhanced sync management
export const shouldRunBackgroundSync = () => {
  const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  const sessionId = sessionStorage.getItem('sync_session');
  
  if (!sessionId) {
    sessionStorage.setItem('sync_session', Date.now().toString());
    console.log('🆕 New session detected, sync allowed');
    return true;
  }
  
  if (!lastSync) {
    console.log('🔄 No previous sync found, sync needed');
    return true;
  }
  
  const lastSyncTime = parseInt(lastSync);
  const timeSinceSync = Date.now() - lastSyncTime;
  const shouldSync = timeSinceSync > 60 * 60 * 1000; // 1 hour
  
  console.log(`⏰ Time since last sync: ${Math.round(timeSinceSync / (60 * 1000))} minutes, sync needed: ${shouldSync}`);
  return shouldSync;
};

export const markSyncCompleted = () => {
  const timestamp = Date.now().toString();
  localStorage.setItem(CACHE_KEYS.LAST_SYNC, timestamp);
  console.log('✅ Sync marked as completed');
};
