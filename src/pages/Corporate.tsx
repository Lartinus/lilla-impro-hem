
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

  let overlap = -80;
  if (parallaxHeight === PARALLAX_HEIGHT_MD) overlap = -100;
  if (parallaxHeight === PARALLAX_HEIGHT_LG) overlap = -120;

  return (
    <div className="bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative min-h-0">
      {/* min-h-0 ser till att ingen onödig höjd reserveras */}
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      <div className="relative">
        <CorporateHero
          parallaxHeight={parallaxHeight}
          imageOffset={imageOffset}
          maxImageOffset={maxImageOffset}
        />
        <section
          className="relative z-10 flex justify-center"
          style={{
            willChange: "transform",
            marginTop: overlap,
            marginBottom: 0,
          }}
        >
          <CorporateContentBox boxOffset={boxOffset} />
        </section>
      </div>
      {/* Footer tas bort på denna sida */}
      <style>{`
        @media (min-width: 768px) {
          .w-full.z-0.select-none.pointer-events-none.relative {
            height: ${PARALLAX_HEIGHT_MD}px !important;
          }
        }
        @media (min-width: 1024px) {
          .w-full.z-0.select-none.pointer-events-none.relative {
            height: ${PARALLAX_HEIGHT_LG}px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Corporate;
