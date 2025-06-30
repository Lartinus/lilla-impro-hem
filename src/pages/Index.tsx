
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import { useBatchedHomePageData } from '@/hooks/useBatchedQueries';
import { useHeroImages } from '@/hooks/useHeroImages';

const Index = () => {
  // Scrolla upp när komponenten mountar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Använd batched queries för att hämta all homepage-data i ett anrop
  const { data: batchedData, isLoading: batchedLoading, error: batchedError } = useBatchedHomePageData();
  
  // Fallback för hero images om batched data inte finns
  const { data: heroData, isLoading: heroLoading } = useHeroImages();

  // Använd batched data eller fallback
  const showsData = batchedData?.showsData;
  const heroImageData = batchedData?.heroImageData || heroData;
  const siteSettingsData = batchedData?.siteSettingsData;

  const isLoading = batchedLoading || heroLoading;

  if (batchedError) {
    console.error('Batched homepage data error:', batchedError);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <Header />
      <Hero 
        heroImageData={heroImageData} 
        isLoading={isLoading}
      />
      <Services 
        showsData={showsData}
        isLoading={isLoading}
      />
      <Footer />
    </div>
  );
};

export default Index;
