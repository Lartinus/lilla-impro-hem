
import { useCourseSync } from '@/hooks/useCourseSync';
import { shouldRunBackgroundSync, markSyncCompleted } from '@/hooks/useOptimizedStrapi';
import { useRef, useCallback } from 'react';

export const useSmartCourseSync = () => {
  const { syncCourses } = useCourseSync();
  const syncInProgress = useRef(false);
  const syncCompleted = useRef(false);

  const runSmartSync = useCallback(async () => {
    // Prevent multiple concurrent syncs
    if (syncInProgress.current || syncCompleted.current) {
      console.log('Sync already in progress or completed for this session');
      return;
    }

    // Check if we should run sync based on session and timing
    if (!shouldRunBackgroundSync()) {
      console.log('Skipping sync - not needed for this session');
      syncCompleted.current = true;
      return;
    }

    syncInProgress.current = true;
    
    try {
      console.log('Running smart background sync...');
      await syncCourses();
      markSyncCompleted();
      syncCompleted.current = true;
      console.log('Smart sync completed successfully');
    } catch (error) {
      console.error('Smart sync failed (silent):', error);
      // Don't throw error - this is background sync
    } finally {
      syncInProgress.current = false;
    }
  }, [syncCourses]);

  return { runSmartSync };
};
