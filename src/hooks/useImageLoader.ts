
import { useState, useEffect, useCallback, useMemo } from 'react';
import { imageCache } from '@/services/imageCache';

export const useImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Memoize the sorted URLs to prevent unnecessary re-renders
  const sortedUrls = useMemo(() => [...imageUrls].sort(), [imageUrls]);
  const urlsKey = useMemo(() => sortedUrls.join(','), [sortedUrls]);

  const handleImageLoad = useCallback((url: string) => {
    setLoadedImages(prev => {
      if (prev.has(url)) return prev; // Already loaded, no state change
      const newSet = new Set(prev);
      newSet.add(url);
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setAllImagesLoaded(true);
      return;
    }

    // Check cache first
    const cachedImages = imageUrls.filter(url => imageCache.isImageLoaded(url));
    setLoadedImages(new Set(cachedImages));

    const allLoaded = cachedImages.length === imageUrls.length;
    setAllImagesLoaded(allLoaded);

    // If not all loaded, preload remaining images with lower priority
    if (!allLoaded) {
      const uncachedUrls = imageUrls.filter(url => 
        !imageCache.isImageLoaded(url) && !imageCache.hasImageFailed(url)
      );
      
      if (uncachedUrls.length > 0) {
        // Use lower priority for batch preloading to not block critical resources
        imageCache.preloadImages(uncachedUrls, false).then((results) => {
          const successUrls = uncachedUrls.filter((_, index) => results[index]);
          if (successUrls.length > 0) {
            setLoadedImages(prev => new Set([...prev, ...successUrls]));
          }
          
          // Check if all images are now loaded
          const totalLoaded = cachedImages.length + successUrls.length;
          setAllImagesLoaded(totalLoaded >= imageUrls.length);
        });
      }
    }
  }, [imageUrls, urlsKey]);

  // Reset state when URLs change significantly
  useEffect(() => {
    const cachedImages = sortedUrls.filter(url => imageCache.isImageLoaded(url));
    setLoadedImages(new Set(cachedImages));
    setAllImagesLoaded(sortedUrls.length === 0 || cachedImages.length === sortedUrls.length);
    setTimeoutReached(false);
  }, [urlsKey, sortedUrls]);

  // Reduced timeout for better perceived performance
  useEffect(() => {
    if (imageUrls.length === 0 || allImagesLoaded) return;
    
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setAllImagesLoaded(true);
    }, 3000); // Reduced from 5 seconds to 3 seconds

    return () => clearTimeout(timeout);
  }, [imageUrls.length, allImagesLoaded]);

  return {
    handleImageLoad,
    allImagesLoaded: allImagesLoaded || timeoutReached,
    loadedCount: loadedImages.size,
    totalCount: imageUrls.length,
    isLoading: !allImagesLoaded && !timeoutReached
  };
};
