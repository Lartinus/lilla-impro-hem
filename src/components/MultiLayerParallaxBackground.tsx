
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

      {/* Bakgrundslager 1 - Överst, längst bak */}
      <div
        className="absolute w-full h-[400px]"
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
            opacity: 0.6,
            filter: 'brightness(0.7) contrast(1.1)',
          }}
          onLoad={() => console.log('Parallax image 1 loaded')}
          onError={() => console.error('Failed to load parallax image 1')}
        />
      </div>

      {/* Bakgrundslager 2 - 300px mellanrum */}
      <div
        className="absolute w-full h-[400px]"
        style={{
          top: '700px', // 400px höjd + 300px mellanrum
          transform: `translateY(${scrollY * 0.35 * intensity}px)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[1]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 0.5,
            filter: 'brightness(0.8) sepia(0.1)',
          }}
          onLoad={() => console.log('Parallax image 2 loaded')}
          onError={() => console.error('Failed to load parallax image 2')}
        />
      </div>

      {/* Mellanrum lager 3 - Ytterligare 300px mellanrum */}
      <div
        className="absolute w-full h-[400px]"
        style={{
          top: '1400px', // 700px + 400px + 300px mellanrum
          transform: `translateY(${scrollY * 0.5 * intensity}px)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[2]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 0.4,
            filter: 'brightness(0.9) saturate(0.8)',
          }}
          onLoad={() => console.log('Parallax image 3 loaded')}
          onError={() => console.error('Failed to load parallax image 3')}
        />
      </div>

      {/* Främsta lagret - Längst ner */}
      <div
        className="absolute w-full h-[400px]"
        style={{
          top: '2100px', // 1400px + 400px + 300px mellanrum
          transform: `translateY(${scrollY * 0.7 * intensity}px)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[3]}
          alt=""
          className="w-full h-full object-cover"
          style={{ 
            opacity: 0.3,
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
    </div>
  );
};

export default MultiLayerParallaxBackground;
