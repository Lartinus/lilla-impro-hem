
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

  // Content box start, e.g. 62% into the hero
  const overlapStart = Math.round(parallaxHeight * 0.62);

  return (
    <div className="bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      {/* Hero-bild ligger absolut och påverkar aldrig content */}
      <div
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{
          height: parallaxHeight,
          overflow: 'hidden',
          minHeight: parallaxHeight,
          maxHeight: parallaxHeight
        }}
        aria-hidden="true"
      >
        <CorporateHero
          parallaxHeight={parallaxHeight}
          imageOffset={imageOffset}
          maxImageOffset={maxImageOffset}
        />
      </div>
      {/* Boxen bestämmer sidans höjd */}
      <main className="relative z-10 flex justify-center pb-0" style={{ paddingBottom: 0, margin: 0 }}>
        <div
          style={{
            marginTop: overlapStart,
            width: '100%',
            paddingBottom: 0,
            marginBottom: 0
            // OBS! Ingen minHeight/maxHeight här!
          }}
        >
          <CorporateContentBox boxOffset={boxOffset} />
        </div>
      </main>
      {/* Dödar absolut all extra-minHeight på html/body från innan */}
      <style>{`
        html, body {
          height: unset !important;
          min-height: unset !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
        #root, body > div, main {
          min-height: 0 !important;
          height: unset !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
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

