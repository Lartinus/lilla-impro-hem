
class ImageCacheService {
  private cache = new Map<string, Promise<boolean>>();
  private loadedImages = new Set<string>();
  private failedImages = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessingQueue = false;

  async preloadImage(src: string): Promise<boolean> {
    if (this.loadedImages.has(src)) {
      return true;
    }

    if (this.failedImages.has(src)) {
      return false;
    }

    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const loadPromise = new Promise<boolean>((resolve) => {
      const img = new Image();
      
      // Set timeout for slow loading images
      const timeout = setTimeout(() => {
        this.cache.delete(src);
        this.failedImages.add(src);
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        this.loadedImages.add(src);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        this.cache.delete(src);
        this.failedImages.add(src);
        resolve(false);
      };
      
      // Use cross-origin anonymous to enable caching
      img.crossOrigin = 'anonymous';
      img.src = src;
    });

    this.cache.set(src, loadPromise);
    return loadPromise;
  }

  // Batch preload images with priority queue
  async preloadImages(srcs: string[], priority = false): Promise<boolean[]> {
    if (priority) {
      // Process high priority images immediately
      return Promise.all(srcs.map(src => this.preloadImage(src)));
    }

    // Add to queue for lower priority images
    this.preloadQueue.push(...srcs.filter(src => !this.cache.has(src)));
    this.processQueue();
    
    return Promise.all(srcs.map(src => this.preloadImage(src)));
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    // Process 3 images at a time to avoid overwhelming the browser
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 3);
      await Promise.all(batch.map(src => this.preloadImage(src)));
      
      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  isImageLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  hasImageFailed(src: string): boolean {
    return this.failedImages.has(src);
  }

  clearCache(): void {
    this.cache.clear();
    this.loadedImages.clear();
    this.failedImages.clear();
    this.preloadQueue = [];
  }

  getCacheSize(): number {
    return this.loadedImages.size;
  }

  getFailedCount(): number {
    return this.failedImages.size;
  }
}

export const imageCache = new ImageCacheService();
