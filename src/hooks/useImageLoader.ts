
import { useState, useEffect, useCallback } from 'react';

export const useImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

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

    const allLoaded = imageUrls.every(url => loadedImages.has(url));
    setAllImagesLoaded(allLoaded);
  }, [loadedImages, imageUrls]);

  return {
    handleImageLoad,
    allImagesLoaded,
    loadedCount: loadedImages.size,
    totalCount: imageUrls.length
  };
};
