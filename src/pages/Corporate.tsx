import Header from '@/components/Header';
import CorporateHero from '@/components/CorporateHero';
import CorporateContentBox from '@/components/CorporateContentBox';
import { useEffect } from 'react';

const Corporate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
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
        }}
      >
        <CorporateContentBox />
      </main>
    </div>
  );
};

export default Corporate;
