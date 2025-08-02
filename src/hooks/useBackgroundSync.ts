
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Background synchronization for less critical data
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Sync data in the background after initial page load
    const syncTimer = setTimeout(() => {
      console.log('🔄 Starting background data sync...');
      
      // Prefetch commonly needed data in background
      queryClient.prefetchQuery({
        queryKey: ['venues-optimized'],
        staleTime: 10 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ['show-tags-optimized'],
        staleTime: 10 * 60 * 1000,
      });

      // Invalidate and refetch data that might be stale
      queryClient.invalidateQueries({
        queryKey: ['admin-show-cards'],
        refetchType: 'none', // Don't refetch immediately, just mark as stale
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-course-cards'],
        refetchType: 'none',
      });

    }, 3000); // Wait 3 seconds after component mount

    return () => clearTimeout(syncTimer);
  }, [queryClient]);

  useEffect(() => {
    // Set up periodic background refresh
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic background refresh...');
      
      // Silently refresh data in background
      queryClient.invalidateQueries({
        queryKey: ['admin-show-cards'],
        refetchType: 'none',
      });

      queryClient.invalidateQueries({
        queryKey: ['admin-course-cards'],
        refetchType: 'none',
      });

    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [queryClient]);
};
