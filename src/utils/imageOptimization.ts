// Image optimization utilities for modern formats and responsive loading
export interface ImageSourceSet {
  avif?: string;
  webp?: string;
  fallback: string;
  sizes?: string;
}

// Standard responsive breakpoints optimized for common screen sizes
const RESPONSIVE_SIZES = [320, 640, 1024, 1920] as const;

/**
 * Generate responsive image sources with modern formats
 * In production, these images would be generated during build process
 */
export const generateResponsiveImageSources = (
  baseSrc: string,
  breakpoints: readonly number[] = RESPONSIVE_SIZES
): ImageSourceSet => {
  if (!baseSrc) return { fallback: '' };
  
  const extension = baseSrc.split('.').pop()?.toLowerCase();
  const baseUrl = baseSrc.replace(/\.[^/.]+$/, '');
  
  // Generate srcSet strings for different formats
  const generateSrcSet = (format: string) => 
    breakpoints.map(size => `${baseUrl}_${size}w.${format} ${size}w`).join(', ');
  
  return {
    avif: generateSrcSet('avif'),
    webp: generateSrcSet('webp'), 
    fallback: breakpoints.length > 1 ? generateSrcSet(extension || 'jpg') : baseSrc,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  };
};

/**
 * Get optimized image URL with modern format fallback
 * Prioritizes AVIF > WebP > Original format
 */
export const getOptimizedImageUrl = (originalSrc: string): string => {
  if (!originalSrc) return '';
  
  // Check if we have optimized versions (in production this would be more sophisticated)
  const baseUrl = originalSrc.replace(/\.[^/.]+$/, '');
  
  // For development, we'll assume WebP versions exist for images in uploads folder
  if (originalSrc.includes('/uploads/images/')) {
    return `${baseUrl}.webp`;
  }
  
  return originalSrc;
};

/**
 * Generate sizes attribute for responsive images based on common layouts
 */
export const generateSizesAttribute = (
  layout: 'hero' | 'card' | 'thumbnail' | 'full-width' | 'custom',
  customSizes?: string
): string => {
  if (layout === 'custom' && customSizes) return customSizes;
  
  const sizesMap = {
    hero: '100vw',
    'full-width': '100vw',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    thumbnail: '(max-width: 640px) 25vw, 150px'
  };
  
  return sizesMap[layout] || sizesMap.card;
};

/**
 * Calculate optimal image dimensions to prevent layout shift
 */
export const calculateAspectRatio = (
  width: number,
  height: number
): { aspectRatio: string; paddingBottom: string } => {
  const ratio = (height / width) * 100;
  return {
    aspectRatio: `${width}/${height}`,
    paddingBottom: `${ratio}%`
  };
};

/**
 * Preload critical images with modern format support
 */
export const preloadCriticalImage = (src: string, format: 'avif' | 'webp' | 'original' = 'webp') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  
  if (format === 'avif') {
    link.href = src.replace(/\.[^/.]+$/, '.avif');
    link.type = 'image/avif';
  } else if (format === 'webp') {
    link.href = src.replace(/\.[^/.]+$/, '.webp');
    link.type = 'image/webp';
  } else {
    link.href = src;
  }
  
  document.head.appendChild(link);
  
  // Clean up after a reasonable time
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }, 10000);
};

/**
 * Generate blur-up placeholder data URL for smooth loading
 */
export const generateBlurPlaceholder = (width = 40, height = 30): string => {
  // Simple SVG blur placeholder - in production this would be generated from actual image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#f0f0f0" filter="url(#blur)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};