class ImageCacheService {
  private cache = new Map<string, Promise<boolean>>();
  private loadedImages = new Set<string>();

  async preloadImage(src: string): Promise<boolean> {
    if (this.loadedImages.has(src)) {
      return true;
    }

    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const loadPromise = new Promise<boolean>((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        resolve(true);
      };
      
      img.onerror = () => {
        this.cache.delete(src);
        resolve(false);
      };
      
      img.src = src;
    });

    this.cache.set(src, loadPromise);
    return loadPromise;
  }

  isImageLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  preloadImages(srcs: string[]): Promise<boolean[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)));
  }

  clearCache(): void {
    this.cache.clear();
    this.loadedImages.clear();
  }

  getCacheSize(): number {
    return this.loadedImages.size;
  }
}

export const imageCache = new ImageCacheService();