
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

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Bakgrundslager 1 - Längst bak, långsammast */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY * 0.2 * intensity}px)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[0]}
          alt=""
          className="w-full h-[120%] object-cover object-center opacity-30"
          style={{ 
            filter: 'brightness(0.7) contrast(1.1)',
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* Bakgrundslager 2 - Diagonal placering */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY * 0.35 * intensity}px) translateX(-10%)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[1]}
          alt=""
          className="w-[110%] h-[110%] object-cover object-left opacity-25"
          style={{ 
            filter: 'brightness(0.8) sepia(0.1)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Mellanrum lager 3 - Höger sida */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY * 0.5 * intensity}px) translateX(15%)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[2]}
          alt=""
          className="w-[100%] h-[105%] object-cover object-right opacity-20"
          style={{ 
            filter: 'brightness(0.9) saturate(0.8)',
            mixBlendMode: 'soft-light'
          }}
        />
      </div>

      {/* Främsta lagret - Snabbast rörelse */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${scrollY * 0.7 * intensity}px) translateX(-5%)`,
          willChange: 'transform'
        }}
      >
        <img
          src={PARALLAX_IMAGES[3]}
          alt=""
          className="w-[105%] h-[100%] object-cover object-center opacity-15"
          style={{ 
            filter: 'brightness(1.1) contrast(0.9)',
            mixBlendMode: 'screen'
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
