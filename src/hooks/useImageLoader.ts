
import { useState, useEffect, useCallback } from 'react';
import { imageCache } from '@/services/imageCache';

export const useImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const handleImageLoad = useCallback((url: string) => {
    setLoadedImages(prev => {
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

    const allLoaded = imageUrls.every(url => 
      loadedImages.has(url) || imageCache.isImageLoaded(url)
    );
    
    setAllImagesLoaded(allLoaded);

    // Preload remaining images
    const uncachedUrls = imageUrls.filter(url => !imageCache.isImageLoaded(url));
    if (uncachedUrls.length > 0) {
      imageCache.preloadImages(uncachedUrls).then(() => {
        setLoadedImages(new Set(imageUrls));
        setAllImagesLoaded(true);
      });
    }
  }, [loadedImages, imageUrls]);

  // Reset loaded images when imageUrls change significantly
  useEffect(() => {
    const urlsString = [...imageUrls].sort().join(',');
    const cachedImages = imageUrls.filter(url => imageCache.isImageLoaded(url));
    setLoadedImages(new Set(cachedImages));
    setAllImagesLoaded(imageUrls.length === 0 || cachedImages.length === imageUrls.length);
    setTimeoutReached(false);
  }, [[...imageUrls].sort().join(',')]);

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    if (imageUrls.length === 0) return;
    
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setAllImagesLoaded(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [imageUrls]);

  return {
    handleImageLoad,
    allImagesLoaded: allImagesLoaded || timeoutReached,
    loadedCount: loadedImages.size,
    totalCount: imageUrls.length
  };
};
