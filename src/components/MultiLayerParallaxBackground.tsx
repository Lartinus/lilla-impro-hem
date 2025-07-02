
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

const MultiLayerParallaxBackground = ({ 
  enabled = true, 
  intensity = 1 
}: MultiLayerParallaxBackgroundProps) => {
  const [scrollY, setScrollY] = useState(0);
  const isMobile = useIsMobile();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;

    const updateScrollY = () => {
      handleScroll();
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
  }, [enabled, handleScroll]);

  if (!enabled) return null;

  // Mobile/Tablet: Single hero image at 600px height
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 w-full h-[600px] overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <div
          className="absolute w-full h-[600px]"
          style={{
            top: '0px',
            transform: `translateY(${scrollY * 0.3 * intensity}px)`,
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
  }

  // Desktop: Multi-layer parallax effect
  return (
    <div 
      className="fixed inset-0 w-full h-[200vh] overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Bakgrundslager 1 - Första bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '0px',
          transform: `translateY(${scrollY * 0.2 * intensity}px)`,
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
          transform: `translateY(${scrollY * 0.35 * intensity}px)`,
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
          transform: `translateY(${scrollY * 0.5 * intensity}px)`,
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
          transform: `translateY(${scrollY * 0.7 * intensity}px)`,
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
