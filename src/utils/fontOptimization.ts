// Font optimization utilities for performance and loading

/**
 * Preload critical fonts to prevent FOUT (Flash of Unstyled Text)
 * Call this for fonts used above the fold
 */
export const preloadFont = (fontUrl: string, fontType: 'woff2' | 'woff' | 'ttf' = 'woff2') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = fontUrl;
  link.as = 'font';
  link.type = `font/${fontType}`;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
  
  return link;
};

/**
 * Create font-face declarations with proper fallbacks and display settings
 */
export const createFontFace = (
  fontFamily: string,
  fontUrl: string,
  options: {
    weight?: string | number;
    style?: 'normal' | 'italic';
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    unicodeRange?: string;
  } = {}
): string => {
  const {
    weight = 400,
    style = 'normal',
    display = 'swap',
    unicodeRange
  } = options;

  return `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl.replace('.woff2', '.woff2')}') format('woff2'),
           url('${fontUrl.replace('.woff2', '.woff')}') format('woff');
      font-weight: ${weight};
      font-style: ${style};
      font-display: ${display};
      ${unicodeRange ? `unicode-range: ${unicodeRange};` : ''}
    }
  `;
};

/**
 * Load fonts asynchronously to prevent render blocking
 */
export const loadFontAsync = (
  fontFamily: string,
  fontUrl: string,
  options: {
    weight?: string;
    style?: 'normal' | 'italic';
    timeout?: number;
  } = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { weight = '400', style = 'normal', timeout = 3000 } = options;
    
    if ('FontFace' in window) {
      const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
        weight,
        style,
        display: 'swap'
      });
      
      const timeoutId = setTimeout(() => {
        reject(new Error(`Font loading timeout: ${fontFamily}`));
      }, timeout);
      
      fontFace.load()
        .then((loadedFont) => {
          clearTimeout(timeoutId);
          (document.fonts as any).add(loadedFont);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    } else {
      // Fallback for older browsers
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `data:text/css;charset=utf-8,${encodeURIComponent(
        createFontFace(fontFamily, fontUrl, { weight: parseInt(weight), style })
      )}`;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${fontFamily}`));
      
      document.head.appendChild(link);
      
      setTimeout(() => {
        reject(new Error(`Font loading timeout: ${fontFamily}`));
      }, timeout);
    }
  });
};

/**
 * Subset fonts to include only required characters
 * In production, this would be done at build time
 */
export const getFontSubsetHint = (language: 'latin' | 'latin-ext' | 'cyrillic' = 'latin'): string => {
  const subsets = {
    latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext': 'U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF',
    cyrillic: 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'
  };
  
  return subsets[language];
};

/**
 * Create optimized CSS for font loading with proper fallbacks
 */
export const generateOptimizedFontCSS = (fonts: Array<{
  family: string;
  url: string;
  weight?: number;
  style?: 'normal' | 'italic';
  fallbacks: string[];
}>): string => {
  const fontFaces = fonts.map(font => 
    createFontFace(font.family, font.url, {
      weight: font.weight,
      style: font.style,
      display: 'swap'
    })
  ).join('\n');
  
  const fontFamilies = fonts.map(font => 
    `${font.family}: ['${font.family}', ${font.fallbacks.map(f => `'${f}'`).join(', ')}]`
  ).join(',\n');
  
  return `
    ${fontFaces}
    
    :root {
      /* Optimized font stack with proper fallbacks */
      ${fonts.map(font => 
        `--font-${font.family.toLowerCase().replace(/\s+/g, '-')}: '${font.family}', ${font.fallbacks.join(', ')};`
      ).join('\n')}
    }
  `;
};

/**
 * Monitor font loading performance
 */
export const monitorFontLoading = (): Promise<{ loadedFonts: string[], failedFonts: string[], loadTime: number }> => {
  const startTime = performance.now();
  const loadedFonts: string[] = [];
  const failedFonts: string[] = [];
  
  return new Promise((resolve) => {
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        const endTime = performance.now();
        
        // Check which fonts loaded successfully
        document.fonts.forEach((fontFace) => {
          if (fontFace.status === 'loaded') {
            loadedFonts.push(fontFace.family);
          } else if (fontFace.status === 'error') {
            failedFonts.push(fontFace.family);
          }
        });
        
        resolve({
          loadedFonts,
          failedFonts,
          loadTime: endTime - startTime
        });
      });
      
      // Fallback timeout
      setTimeout(() => {
        resolve({
          loadedFonts,
          failedFonts,
          loadTime: performance.now() - startTime
        });
      }, 5000);
    } else {
      // Browser doesn't support Font Loading API
      resolve({
        loadedFonts: [],
        failedFonts: [],
        loadTime: 0
      });
    }
  });
};