// src/pages/Shows.tsx
import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import ShowCard from '@/components/ShowCard';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';

const Shows: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: strapiData, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const shows = useMemo(
    () =>
      strapiData?.data
        ? (strapiData.data as any[]).map(formatStrapiShowSimple).filter(Boolean)
        : [],
    [strapiData]
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi overflow-x-hidden overflow-y-visible">
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi overflow-x-hidden overflow-y-visible">
      <link
        href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
        rel="stylesheet"
      />
      <Header />

      {/* Hero */}
      <section className="text-center mt-16 md:py-6 md:px-4 px-0 py-px relative z-10">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
          Föreställningar
        </h1>
      </section>

      {/* Grid */}
      <section className="flex-1 py-2 px-0.5 md:px-4 pb-8 relative z-10">
        <div className="mx-[12px] md:mx-0 md:max-w-6xl md:mx-auto">
          {isLoading ? (
            <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShowCardSkeleton key={i} />
              ))}
            </div>
          ) : shows.length > 0 ? (
            <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map(show => (
                <ShowCard key={show.id} show={show} />
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
