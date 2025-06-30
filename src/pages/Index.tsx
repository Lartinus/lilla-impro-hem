
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import { useBatchedHomePageData } from '@/hooks/useBatchedQueries';

const Index = () => {
  // Scrolla upp när komponenten mountar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Använd batched queries för att hämta all homepage-data i ett anrop
  const { data: batchedData, isLoading, error } = useBatchedHomePageData();

  if (error) {
    console.error('Batched homepage data error:', error);
  }

  // Extract data från batched response
  const showsData = batchedData?.showsData;
  const heroImageData = batchedData?.heroImageData;
  const siteSettingsData = batchedData?.siteSettingsData;

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
