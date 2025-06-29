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
      className="relative overflow-x-hidden bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary"
      style={{
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
        width: '100vw',
        minHeight: '100dvh',
      }}
    >
      <Header />
      <CorporateHero />
      <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
        <CorporateContentBox />
      </main>
    </div>
  );
};

export default Corporate;
