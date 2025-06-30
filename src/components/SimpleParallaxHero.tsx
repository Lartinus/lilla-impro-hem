
import { useState, useEffect } from "react";

interface SimpleParallaxHeroProps {
  imageSrc: string;
  parallaxHeight?: number;
  gradientOverlay?: boolean;
}

const PARALLAX_HEIGHT_MOBILE = 400;
const PARALLAX_HEIGHT_MD = 620;
const PARALLAX_HEIGHT_LG = 750;

const getParallaxHeights = () => {
  if (window.innerWidth >= 1024) return PARALLAX_HEIGHT_LG;
  if (window.innerWidth >= 768) return PARALLAX_HEIGHT_MD;
  return PARALLAX_HEIGHT_MOBILE;
};

const SimpleParallaxHero = ({
  imageSrc,
  parallaxHeight,
  gradientOverlay = true,
}: SimpleParallaxHeroProps) => {
  const [height, setHeight] = useState(parallaxHeight || PARALLAX_HEIGHT_MOBILE);

  useEffect(() => {
    const handleResize = () => setHeight(parallaxHeight || getParallaxHeights());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [parallaxHeight]);

  return (
    <div
      className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
      style={{
        height,
        minHeight: height,
        maxHeight: height,
        overflow: 'hidden',
        pointerEvents: 'none',
        position: 'absolute',
        top: 0, left: 0, zIndex: 0, width: '100vw',
      }}
      aria-hidden="true"
    >
      <div
        className="w-full z-0 select-none pointer-events-none relative"
        style={{
          height,
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt=""
          className="w-full h-full object-cover object-center pointer-events-none"
          style={{
            height: '100%',
            width: '100%',
            display: 'block',
            margin: 0,
            padding: 0,
            filter: 'brightness(0.97)',
            userSelect: 'none',
          }}
          draggable={false}
        />
        {gradientOverlay && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.10)" }} />
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .pointer-events-none.select-none.absolute.top-0.left-0.w-full.z-0 {
            height: ${PARALLAX_HEIGHT_MD}px !important;
            min-height: ${PARALLAX_HEIGHT_MD}px !important;
            max-height: ${PARALLAX_HEIGHT_MD}px !important;
          }
        }
        @media (min-width: 1024px) {
          .pointer-events-none.select-none.absolute.top-0.left-0.w-full.z-0 {
            height: ${PARALLAX_HEIGHT_LG}px !important;
            min-height: ${PARALLAX_HEIGHT_LG}px !important;
            max-height: ${PARALLAX_HEIGHT_LG}px !important;
          }
        }
      `}</style>
    </div>
  );
};
export default SimpleParallaxHero;
