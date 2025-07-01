
import { useState, useEffect, useCallback } from 'react';

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

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    // Debug: Log scroll values to console
    console.log('Parallax scroll Y:', currentScrollY);
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

  // Debug: Log that component is rendering
  console.log('Parallax component rendering with enabled:', enabled);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Debug indicator - remove after testing */}
      <div 
        className="absolute top-4 left-4 bg-red-500 text-white p-2 text-sm z-50 pointer-events-auto"
        style={{ position: 'fixed' }}
      >
        Parallax Active - Scroll: {scrollY}px
      </div>

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
          onLoad={() => console.log('Parallax image 1 loaded')}
          onError={() => console.error('Failed to load parallax image 1')}
        />
      </div>

      {/* Bakgrundslager 2 - Överlappande med första bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '350px', // Överlappande med 150px
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
          onLoad={() => console.log('Parallax image 2 loaded')}
          onError={() => console.error('Failed to load parallax image 2')}
        />
      </div>

      {/* Bakgrundslager 3 - Överlappande med andra bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '700px', // Överlappande med 150px
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
          onLoad={() => console.log('Parallax image 3 loaded')}
          onError={() => console.error('Failed to load parallax image 3')}
        />
      </div>

      {/* Bakgrundslager 4 - Överlappande med tredje bilden */}
      <div
        className="absolute w-full h-[500px]"
        style={{
          top: '1050px', // Överlappande med 150px
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
          onLoad={() => console.log('Parallax image 4 loaded')}
          onError={() => console.error('Failed to load parallax image 4')}
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

      {/* Logotyp längst ner, ovanpå bilderna men under den vita boxen */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-5">
        <img
          src="/uploads/LIT_WoB_large.png"
          alt="Lilla Improteatern logotyp"
          className="h-20 md:h-24"
        />
      </div>
    </div>
  );
};

export default MultiLayerParallaxBackground;
