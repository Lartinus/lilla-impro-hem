
import { useState, useEffect, useCallback } from 'react';

export const useImageLoader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const handleImageLoad = useCallback((url: string) => {
    console.log('Image loaded:', url);
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(url);
      return newSet;
    });
  }, []);

  useEffect(() => {
    console.log('Image URLs changed:', imageUrls);
    console.log('Loaded images:', Array.from(loadedImages));
    
    if (imageUrls.length === 0) {
      console.log('No images to load, setting allImagesLoaded to true');
      setAllImagesLoaded(true);
      return;
    }

    const allLoaded = imageUrls.every(url => {
      const isLoaded = loadedImages.has(url);
      console.log('Image', url, 'loaded:', isLoaded);
      return isLoaded;
    });
    
    console.log('All images loaded:', allLoaded);
    setAllImagesLoaded(allLoaded);
  }, [loadedImages, imageUrls]);

  return {
    handleImageLoad,
    allImagesLoaded,
    loadedCount: loadedImages.size,
    totalCount: imageUrls.length
  };
};
