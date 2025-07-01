
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Enhanced cache configuration with performance optimizations
const OPTIMIZED_CACHE_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
  retry: 3, // Increased retries for better reliability
  retryDelay: (attemptIndex: number) => Math.min(1000 * Math.pow(2, attemptIndex), 8000),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: true, // Refetch when network reconnects
};

// Enhanced localStorage keys
const CACHE_KEYS = {
  COURSES: 'strapi_courses_cache_v2',
  SHOWS: 'strapi_shows_cache_v2',
  LAST_SYNC: 'last_sync_timestamp',
  PERFORMANCE_METRICS: 'api_performance_metrics',
} as const;

// Performance monitoring utility
const measurePerformance = (operation: string) => {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`⏱️ ${operation} took ${duration.toFixed(2)}ms`);
      
      // Store performance metrics
      try {
        const metrics = getPerformanceMetrics();
        metrics[operation] = {
          lastDuration: duration,
          lastRun: Date.now(),
          averageDuration: metrics[operation] 
            ? (metrics[operation].averageDuration * 0.8 + duration * 0.2) 
            : duration
        };
        localStorage.setItem(CACHE_KEYS.PERFORMANCE_METRICS, JSON.stringify(metrics));
      } catch (error) {
        console.warn('Failed to store performance metrics:', error);
      }
      
      return duration;
    }
  };
};

const getPerformanceMetrics = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEYS.PERFORMANCE_METRICS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Enhanced cache utilities with background refresh capability
const saveToCache = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: '2.0', // Updated version for new cache format
      size: JSON.stringify(data).length
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`💾 Cached ${key} successfully (${(cacheData.size / 1024).toFixed(1)}KB)`);
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

const getFromCache = (key: string, maxAge = 60 * 60 * 1000) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp, version, size } = JSON.parse(cached);
    
    // Check version compatibility
    if (version !== '2.0') {
      console.log(`🔄 Cache version mismatch for ${key}, invalidating`);
      localStorage.removeItem(key);
      return null;
    }
    
    const age = Date.now() - timestamp;
    if (age > maxAge) {
      console.log(`⏰ Cache expired for ${key} (${Math.round(age / 60000)}min old)`);
      return null;
    }
    
    console.log(`✅ Using cached ${key} (${Math.round(age / 1000)}s old, ${(size / 1024).toFixed(1)}KB)`);
    return data;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
};

// Background refresh utility
const scheduleBackgroundRefresh = (queryKey: string, queryFn: () => Promise<any>) => {
  // Schedule background refresh after 20 minutes
  setTimeout(async () => {
    try {
      console.log(`🔄 Running background refresh for ${queryKey}`);
      const data = await queryFn();
      if (queryKey.includes('courses')) {
        saveToCache(CACHE_KEYS.COURSES, data);
      } else if (queryKey.includes('shows')) {
        saveToCache(CACHE_KEYS.SHOWS, data);
      }
    } catch (error) {
      console.log(`⚠️ Background refresh failed for ${queryKey}:`, error);
    }
  }, 20 * 60 * 1000); // 20 minutes
};

// Enhanced courses query with performance monitoring and background refresh
export const useOptimizedCourses = () => {
  return useQuery({
    queryKey: ['courses-optimized-v2'],
    queryFn: async () => {
      const perf = measurePerformance('Courses fetch');
      
      try {
        console.log('🔄 Fetching courses with enhanced optimization...');
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
        
        // Schedule background refresh
        scheduleBackgroundRefresh('courses', async () => {
          const { data: bgData } = await supabase.functions.invoke('strapi-courses');
          return bgData;
        });
        
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
    ...OPTIMIZED_CACHE_CONFIG,
  });
};

// Enhanced shows query with performance monitoring and background refresh
export const useOptimizedShows = () => {
  return useQuery({
    queryKey: ['shows-optimized-v2'],
    queryFn: async () => {
      const perf = measurePerformance('Shows fetch');
      
      try {
        console.log('🔄 Fetching shows with enhanced optimization...');
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
        
        // Schedule background refresh
        scheduleBackgroundRefresh('shows', async () => {
          const { data: bgData } = await supabase.functions.invoke('strapi-shows');
          return bgData;
        });
        
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
    ...OPTIMIZED_CACHE_CONFIG,
  });
};

// Enhanced sync management with performance awareness
export const shouldRunBackgroundSync = () => {
  const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  const sessionId = sessionStorage.getItem('sync_session');
  const metrics = getPerformanceMetrics();
  
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
  const hoursSinceSync = timeSinceSync / (60 * 60 * 1000);
  
  // Adaptive sync interval based on performance
  const avgDuration = Math.max(
    metrics['Courses fetch']?.averageDuration || 0,
    metrics['Shows fetch']?.averageDuration || 0
  );
  
  // If API is slow (>10s), sync less frequently
  const syncInterval = avgDuration > 10000 ? 2 : 1; // 2 hours vs 1 hour
  const shouldSync = hoursSinceSync > syncInterval;
  
  console.log(`⏰ Time since last sync: ${hoursSinceSync.toFixed(1)}h, avg API time: ${avgDuration.toFixed(0)}ms, sync needed: ${shouldSync}`);
  return shouldSync;
};

export const markSyncCompleted = () => {
  const timestamp = Date.now().toString();
  localStorage.setItem(CACHE_KEYS.LAST_SYNC, timestamp);
  console.log('✅ Sync marked as completed');
};

// Export performance metrics for debugging
export const getApiPerformanceMetrics = () => getPerformanceMetrics();
