
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
import { useBatchedPageContent } from '@/hooks/useBatchedQueries';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

const Corporate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Använd batched queries för att hämta alla content-typer för Corporate-sidan
  const { data: batchedContent, isLoading, error } = useBatchedPageContent(['private-party']);
  
  const privatePartyData = batchedContent?.['private-party'];

  if (error) {
    console.error('Corporate page content error:', error);
  }

  const info = privatePartyData?.data?.info || '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible">
      <Header />
      
      <section className="px-0.5 md:px-4 mt-16 py-6 flex-1 relative z-10">
        <div className="mx-[12px] md:mx-auto md:max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-theatre-light">
            Företagsevent
          </h1>
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-theatre-light/20 rounded w-3/4"></div>
              <div className="h-4 bg-theatre-light/20 rounded w-full"></div>
              <div className="h-4 bg-theatre-light/20 rounded w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {info && (
                <div 
                  className="text-theatre-light/90 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(info) }}
                />
              )}
              
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 text-theatre-light">
                  Kontakta oss för företagsevent
                </h2>
                <CorporateInquiryForm />
              </div>
            </div>
          )}
        </div>
      </section>
      
      <SimpleParallaxHero imageSrc="/uploads/images/corporate_LIT_2024.jpg" />
    </div>
  );
};

export default Corporate;
