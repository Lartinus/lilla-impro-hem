
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
    const handleResize = () => setParallaxHeight(getParallaxHeights());
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
  const boxOffset = Math.max(0, Math.min(scrollY, parallaxHeight * 0.45));
  const overlapStart = Math.round(parallaxHeight * 0.44);

  return (
    <div 
      className="font-satoshi relative overflow-x-hidden overflow-y-visible"
      style={{
        boxSizing: "border-box",
        padding: 0,
        margin: 0,
      }}
    >
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      {/* Hero - alltid absolut ovanför, påverkar inte sidans "flow height" */}
      <div
        className="pointer-events-none select-none absolute top-0 left-0 w-full z-0"
        style={{
          height: parallaxHeight,
          minHeight: parallaxHeight,
          maxHeight: parallaxHeight,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <CorporateHero
          parallaxHeight={parallaxHeight}
          imageOffset={imageOffset}
          maxImageOffset={maxImageOffset}
        />
      </div>
      {/* MAIN wrapper: bakgrund, paddingTop för hero, inget mer */}
      <main 
        className="z-10 w-full relative bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary overflow-x-hidden overflow-y-visible"
        style={{
          boxSizing: "border-box",
          margin: 0,
          padding: 0,
          paddingTop: overlapStart,
        }}
      >
        <CorporateContentBox boxOffset={boxOffset} />
        {/* DEBUG: liten border längst ner för att kunna se page-end */}
        {/* <div style={{borderTop: '3px dashed red'}} /> */}
      </main>
      <style>{`
        html, body, #root {
          box-sizing: border-box !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          background: none !important;
        }
        .pointer-events-none.select-none.absolute.top-0.left-0.w-full.z-0 {
          position: absolute !important;
          top: 0 !important; left: 0 !important; z-index: 0 !important; width: 100vw !important;
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
