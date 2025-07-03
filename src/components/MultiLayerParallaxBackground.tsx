import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MultiLayerParallaxBackgroundProps {
  enabled?: boolean;
  intensity?: number;
}

const PARALLAX_IMAGES = [
  '/uploads/images/parallax/ParallaxImage1.jpg',
  '/uploads/images/parallax/ParallaxImage2.jpg',
  '/uploads/images/parallax/ParallaxImage3.jpg',
  '/uploads/images/parallax/ParallaxImage4.jpg',
];

// Throttle function for better performance on mobile
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const MultiLayerParallaxBackground = ({ 
  enabled = true, 
  intensity = 1 
}: MultiLayerParallaxBackgroundProps) => {
  const [scrollY, setScrollY] = useState(0);
  const isMobile = useIsMobile();

  // Increase mobile intensity significantly for visible parallax effect
  const mobileIntensity = intensity * 2.5;
  const effectiveIntensity = isMobile ? mobileIntensity : intensity;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
  }, []);

  // Reduce throttling on mobile for smoother parallax
  const throttledHandleScroll = useCallback(
    throttle(handleScroll, isMobile ? 16 : 16), // Same smooth rate for both mobile and desktop
    [handleScroll, isMobile]
  );

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;

    const updateScrollY = () => {
      if (isMobile) {
        // Use requestAnimationFrame on mobile too for smoother parallax
        handleScroll();
      } else {
        handleScroll();
      }
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    return () => window.removeEventListener('scroll', requestTick);
  }, [enabled, handleScroll, isMobile]);

  if (!enabled) return null;

  // Mobile/Tablet: Single hero image with enhanced parallax effect
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 w-full h-[500px] overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div
          className="absolute w-full h-[500px]"
          style={{
            top: '0px',
            // Increased parallax value from -0.1 to -0.3 for visible effect
            transform: `translate3d(0, ${scrollY * -0.3 * effectiveIntensity}px, 0)`,
            willChange: 'transform'
          }}
        >
          <img
            src={PARALLAX_IMAGES[0]}
            alt=""
            className="w-full h-full object-cover"
            style={{ 
              opacity: 1,
              // Remove heavy filters on mobile for better performance
              backfaceVisibility: 'hidden',
              perspective: 1000,
            }}
          />
        </div>

        {/* Simplified gradient overlay for mobile */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: `linear-gradient(135deg, 
              rgba(119, 36, 36, 0.05) 0%, 
              rgba(58, 18, 18, 0.1) 50%, 
              rgba(119, 36, 36, 0.05) 100%)`
          }} 
        />
      </div>
    );
  }

  // Desktop: Multi-layer parallax effect with full features - reduced first layer height by 100px
  return (
    <div 
      className="fixed inset-0 w-full h-[200vh] overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Bakgrundslager 1 - Första bilden - reduced from h-[500px] to h-[400px] */}
      <div
        className="absolute w-full h-[400px]"
        style={{
          top: '0px',
          transform: `translate3d(0, ${scrollY * -0.2 * effectiveIntensity}px, 0)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[0]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 1,
            filter: 'brightness(0.7) contrast(1.1)',
          }}
        />
      </div>

      {/* Bakgrundslager 2 - Överlappande med första bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '350px',
          transform: `translate3d(0, ${scrollY * -0.35 * effectiveIntensity}px, 0)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[1]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 1,
            filter: 'brightness(0.8) sepia(0.1)',
          }}
        />
      </div>

      {/* Bakgrundslager 3 - Överlappande med andra bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '700px',
          transform: `translate3d(0, ${scrollY * -0.5 * effectiveIntensity}px, 0)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[2]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 1,
            filter: 'brightness(0.9) saturate(0.8)',
          }}
        />
      </div>

      {/* Bakgrundslager 4 - Överlappande med tredje bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '1050px',
          transform: `translate3d(0, ${scrollY * -0.7 * effectiveIntensity}px, 0)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[3]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 1,
            filter: 'brightness(1.1) contrast(0.9)',
          }}
        />
      </div>

      {/* Gradient overlay för att smälta samman med sidans färgschema */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(135deg, 
            rgba(119, 36, 36, 0.1) 0%, 
            rgba(58, 18, 18, 0.2) 50%, 
            rgba(119, 36, 36, 0.1) 100%)`
        }} 
      />
    </div>
  );
};

export default MultiLayerParallaxBackground;
