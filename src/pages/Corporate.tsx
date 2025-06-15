
import Header from '@/components/Header';
import CorporateHero from '@/components/CorporateHero';
import CorporateContentBox from '@/components/CorporateContentBox';
import { useEffect, useState } from 'react';

const PARALLAX_HEIGHT_MOBILE = 400;
const PARALLAX_HEIGHT_MD = 620;
const PARALLAX_HEIGHT_LG = 750;
const PARALLAX_IMAGE_FACTOR = 0.4;

const getParallaxHeights = () => {
  if (window.innerWidth >= 1024) return PARALLAX_HEIGHT_LG;
  if (window.innerWidth >= 768) return PARALLAX_HEIGHT_MD;
  return PARALLAX_HEIGHT_MOBILE;
};

const Corporate = () => {
  const [scrollY, setScrollY] = useState(0);
  const [parallaxHeight, setParallaxHeight] = useState(PARALLAX_HEIGHT_MOBILE);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => {
      setParallaxHeight(getParallaxHeights());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const maxImageOffset = parallaxHeight * 0.6;
  const imageOffset = Math.min(scrollY * PARALLAX_IMAGE_FACTOR, maxImageOffset);
  const boxOffset = Math.min(scrollY, parallaxHeight - 64);

  const overlapStart = Math.round(parallaxHeight * 0.62);

  return (
    <div className="bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      {/* Hero-bild absolut placerad */}
      <div
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{
          height: parallaxHeight,
          minHeight: parallaxHeight,
          maxHeight: parallaxHeight,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <CorporateHero
          parallaxHeight={parallaxHeight}
          imageOffset={imageOffset}
          maxImageOffset={maxImageOffset}
        />
      </div>
      {/* Endast EN wrapper - blocklayout! */}
      <main className="relative z-10" style={{ padding: 0, margin: 0 }}>
        <div
          style={{
            marginTop: overlapStart,
            width: '100%',
            padding: 0,
            margin: 0
          }}
        >
          <CorporateContentBox boxOffset={boxOffset} />
        </div>
      </main>
      {/* CSS-reset som tvingar bort ALL höjd från html, body, root, main */}
      <style>{`
        html, body {
          overflow-x: hidden !important;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        #root, body > div, main {
          min-height: 0 !important;
          height: auto !important;
          max-height: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        /* Hero ska aldrig påverka höjd */
        .pointer-events-none.select-none.absolute.top-0.left-0.w-full.z-0 {
          position: absolute !important;
          top: 0 !important; left: 0 !important;
          z-index: 0 !important;
          width: 100vw !important;
        }
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

export default Corporate;

