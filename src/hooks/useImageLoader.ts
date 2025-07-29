
import { useState, useEffect, useCallback } from 'react';

export const useImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const handleImageLoad = useCallback((url: string) => {
    console.log('useImageLoader: Image loaded:', url);
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(url);
      console.log('useImageLoader: Updated loaded images:', Array.from(newSet));
      return newSet;
    });
  }, []);

  useEffect(() => {
    console.log('useImageLoader: Image URLs changed:', imageUrls);
    console.log('useImageLoader: Currently loaded images:', Array.from(loadedImages));
    
    // Reset state when URLs change
    if (imageUrls.length === 0) {
      console.log('useImageLoader: No images to load, setting allImagesLoaded to true');
      setAllImagesLoaded(true);
      return;
    }

    const allLoaded = imageUrls.every(url => {
      const isLoaded = loadedImages.has(url);
      console.log('useImageLoader: Checking image', url, 'loaded:', isLoaded);
      return isLoaded;
    });
    
    console.log('useImageLoader: All images loaded status:', allLoaded, `(${loadedImages.size}/${imageUrls.length})`);
    setAllImagesLoaded(allLoaded);
  }, [loadedImages, imageUrls]);

  // Reset loaded images when imageUrls change significantly
  useEffect(() => {
    const urlsString = [...imageUrls].sort().join(',');
    console.log('useImageLoader: URL change detected, resetting loaded images. New URLs:', urlsString);
    setLoadedImages(new Set());
    setAllImagesLoaded(imageUrls.length === 0);
    setTimeoutReached(false);
  }, [[...imageUrls].sort().join(',')]);

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    if (imageUrls.length === 0) return;
    
    const timeout = setTimeout(() => {
      console.log('useImageLoader: Timeout reached, marking all images as loaded');
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
