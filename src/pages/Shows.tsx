
import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';
import { useSmartPrefetch } from '@/hooks/useSmartPrefetch';

const containerClasses =
  'min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible';

const Shows = () => {
  const { prefetchShowOnHover } = useSmartPrefetch();

  // Scrolla alltid upp när komponenten mountar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hämta föreställningar med React Query - optimized caching
  const { data: strapiData, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      console.log('Fetching shows...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      const endTime = performance.now();
      console.log(`Shows API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - increased
    gcTime: 60 * 60 * 1000, // 1 hour - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Formatera data en gång per uppdatering
  const shows = useMemo(() => {
    const items = strapiData?.data ?? [];
    return items.map(formatStrapiShowSimple).filter(Boolean);
  }, [strapiData]);

  // Felhantering med bättre användarfeedback
  if (error) {
    console.error('Error loading shows from Strapi:', error);
    return (
      <div className={containerClasses}>
        <Header />
        <section className="px-0.5 md:px-4 mt-16 py-6 flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-4 text-theatre-light">
              Något gick fel
            </h2>
            <p className="text-theatre-light/80 mb-4">
              Vi kunde inte ladda föreställningarna just nu. Försök igen om en stund.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-accent-color-primary hover:bg-accent-color-hover text-white px-4 py-2 rounded-none"
            >
              Försök igen
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Normal vy med förbättrade loading states
  return (
    <div className={containerClasses}>
      <Header />

      {/* Hero */}
      <section className="md:px-4 mt-16 md:py-6 px-0 relative z-10"></section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 flex-1 relative z-10">
        <div className="mx-[12px] md:mx-auto md:max-w-6xl">
          {isLoading ? (
            <>
              <div className="mb-4 animate-pulse">
                <div className="h-4 bg-theatre-light/20 rounded w-48 mx-auto md:mx-0"></div>
              </div>
              <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {[...Array(6)].map((_, idx) => (
                  <ShowCardSkeleton key={idx} />
                ))}
              </div>
            </>
          ) : shows.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-theatre-light/80 text-center md:text-left">
                  {shows.length} föreställning{shows.length !== 1 ? 'ar' : ''} tillgänglig{shows.length !== 1 ? 'a' : ''}
                </p>
              </div>
              <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {shows.map((show) => (
                  <div
                    key={`show-${show.id}-${show.slug}`}
                    onMouseEnter={() => prefetchShowOnHover(show.slug)}
                  >
                    <ShowCardSimple show={show} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-theatre-light/80 py-12">
              <h2 className="text-xl font-bold mb-4">Inga föreställningar just nu</h2>
              <p>Vi har inga föreställningar ute just nu. Kom gärna tillbaka senare!</p>
            </div>
          )}
        </div>
      </section>

      <SimpleParallaxHero imageSrc="/uploads/images/shows_2024.jpg" />
    </div>
  );
};

export default Shows;
