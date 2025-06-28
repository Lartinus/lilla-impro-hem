import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';

const containerClasses =
  'min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible';

const Shows = () => {
  // Scrolla alltid upp när komponenten mountar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hämta föreställningar med React Query
  const { data: strapiData, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime:    30 * 60 * 1000,
    retry:     2,
    refetchOnWindowFocus: false,
  });

  // Formatera data en gång per uppdatering
  const shows = useMemo(() => {
    const items = strapiData?.data ?? [];
    return items.map(formatStrapiShowSimple).filter(Boolean);
  }, [strapiData]);

  // Felhantering
  if (error) {
    console.error('Error loading shows from Strapi:', error);
    return (
      <div className={containerClasses}>
        <Header />
        <section className="px-0.5 md:px-4 mt-16 py-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
              Föreställningar
            </h1>
            <p className="text-theatre-light/80">
              Ett fel uppstod vid laddning av föreställningar. Försök igen!
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Normal vy
  return (
    <div className={containerClasses}>
      <Header />

      {/* Hero */}
      <section className="md:px-4 mt-16 md:py-6 px-0 relative z-10">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
            Föreställningar
          </h1>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 flex-1 relative z-10">
        <div className="mx-[12px] md:mx-auto md:max-w-6xl">
          {isLoading ? (
            <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {[...Array(6)].map((_, idx) => (
                <ShowCardSkeleton key={idx} />
              ))}
            </div>
          ) : shows.length > 0 ? (
            <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map((show) => (
                <ShowCardSimple
                  key={`show-${show.id}-${show.slug}`}
                  show={show}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-theatre-light/80">
              <p>Vi har inga föreställningar ute just nu. Kom gärna tillbaka senare!</p>
            </div>
          )}
        </div>
      </section>

      <SimpleParallaxHero imageSrc="/lovable-uploads/8a317688-a91b-4083-8840-22ca50335205.png" />
    </div>
  );
};

export default Shows;
