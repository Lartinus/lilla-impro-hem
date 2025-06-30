
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Unified cache configuration for all course-related queries
const UNIFIED_CACHE_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
  retry: 1,
  retryDelay: 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

// localStorage keys for fallback data
const CACHE_KEYS = {
  COURSES: 'strapi_courses_cache',
  SHOWS: 'strapi_shows_cache',
  LAST_SYNC: 'last_sync_timestamp',
} as const;

// Utility to save data to localStorage
const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

// Utility to get data from localStorage
const getFromCache = (key: string, maxAge = 60 * 60 * 1000) => { // 1 hour default
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) return null;
    
    return data;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
};

// Unified courses query with fallback
export const useOptimizedCourses = () => {
  return useQuery({
    queryKey: ['courses-optimized'],
    queryFn: async () => {
      try {
        console.log('Fetching courses with optimized strategy...');
        const { data, error } = await supabase.functions.invoke('strapi-courses');
        
        if (error) {
          console.error('Strapi courses error:', error);
          // Try fallback from cache
          const cachedData = getFromCache(CACHE_KEYS.COURSES);
          if (cachedData) {
            console.log('Using cached courses data as fallback');
            return cachedData;
          }
          throw new Error(`Kurser kunde inte laddas: ${error.message}`);
        }
        
        // Save to cache for future fallback
        saveToCache(CACHE_KEYS.COURSES, data);
        console.log('Successfully fetched and cached courses');
        return data;
      } catch (error) {
        console.error('Final error in courses fetch:', error);
        // Last resort: try cache even if it's older
        const cachedData = getFromCache(CACHE_KEYS.COURSES, 24 * 60 * 60 * 1000); // 24 hours
        if (cachedData) {
          console.log('Using stale cached courses data as last resort');
          return cachedData;
        }
        throw error;
      }
    },
    ...UNIFIED_CACHE_CONFIG,
  });
};

// Unified shows query with fallback
export const useOptimizedShows = () => {
  return useQuery({
    queryKey: ['shows-optimized'],
    queryFn: async () => {
      try {
        console.log('Fetching shows with optimized strategy...');
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        
        if (error) {
          console.error('Strapi shows error:', error);
          const cachedData = getFromCache(CACHE_KEYS.SHOWS);
          if (cachedData) {
            console.log('Using cached shows data as fallback');
            return cachedData;
          }
          throw error;
        }
        
        saveToCache(CACHE_KEYS.SHOWS, data);
        console.log('Successfully fetched and cached shows');
        return data;
      } catch (error) {
        console.error('Final error in shows fetch:', error);
        const cachedData = getFromCache(CACHE_KEYS.SHOWS, 24 * 60 * 60 * 1000);
        if (cachedData) {
          console.log('Using stale cached shows data as last resort');
          return cachedData;
        }
        throw error;
      }
    },
    ...UNIFIED_CACHE_CONFIG,
  });
};

// Check if we should run background sync (once per session)
export const shouldRunBackgroundSync = () => {
  const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  const sessionId = sessionStorage.getItem('sync_session');
  
  if (!sessionId) {
    // New session - set session ID and allow sync
    sessionStorage.setItem('sync_session', Date.now().toString());
    return true;
  }
  
  if (!lastSync) return true;
  
  // Only sync if more than 1 hour since last sync
  const lastSyncTime = parseInt(lastSync);
  return Date.now() - lastSyncTime > 60 * 60 * 1000;
};

// Mark sync as completed
export const markSyncCompleted = () => {
  localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
};
