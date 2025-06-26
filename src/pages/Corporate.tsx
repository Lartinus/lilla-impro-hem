import Header from '@/components/Header';
import CorporateHero from '@/components/CorporateHero';
import CorporateContentBox from '@/components/CorporateContentBox';
import { useEffect, useState } from 'react';

const Corporate = () => {
  const [marginTop, setMarginTop] = useState('-150px');

  useEffect(() => {
    window.scrollTo(0, 0);

    const updateMarginTop = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setMarginTop('-300px'); // desktop
      } else if (width >= 768) {
        setMarginTop('-200px'); // tablet
      } else {
        setMarginTop('-120px'); // mobile
      }
    };

    updateMarginTop();
    window.addEventListener('resize', updateMarginTop);
    return () => window.removeEventListener('resize', updateMarginTop);
  }, []);

  return (
    <div
      className="font-satoshi relative overflow-x-hidden bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary"
      style={{
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
        width: '100vw',
        minHeight: '100dvh',
      }}
    >
      <link
        href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
        rel="stylesheet"
      />
      <Header />
      <CorporateHero />
      <main
        className="z-10 w-full relative overflow-x-hidden pb-16 md:pb-28"
        style={{
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          paddingBottom: '64px',
          marginTop,
        }}
      >
        <CorporateContentBox />
      </main>
    </div>
  );
};

export default Corporate;
