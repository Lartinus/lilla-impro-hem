// src/pages/Shows.tsx
import Header from '@/components/Header';
import ShowCard, { Show } from '@/components/ShowCard';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';

const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: strapiData, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      if (error) throw error;
      return data as any[];
    },
    staleTime: 10 * 60_000,
    gcTime:    30 * 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const shows: Show[] = useMemo(() => {
    return strapiData
      ? strapiData.map(formatStrapiShowSimple).filter((s): s is Show => !!s)
      : [];
  }, [strapiData]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi overflow-x-hidden">
        <Header />
        <section className="mt-16 py-6 flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Föreställningar</h1>
            <p className="text-theatre-light/80">Ett fel uppstod vid laddning. Försök igen!</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="mt-16 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Föreställningar</h1>
      </section>

      {/* Shows Grid */}
      <section className="flex-1 py-8 px-4">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {[...Array(6)].map((_, i) => (
                <ShowCard key={`skeleton-${i}`} show={null} variant="simple" />
              ))}
            </div>
          ) : shows.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map(show => (
                <ShowCard key={show.id} show={show} variant="simple" />
              ))}
            </div>
          ) : (
            <div className="text-center text-theatre-light/80">
              <p>Inga föreställningar just nu. Kom tillbaka snart!</p>
            </div>
          )}
        </div>
      </section>

      <SimpleParallaxHero imageSrc="/lovable-uploads/8a317688-a91b-4083-8840-22ca50335205.png" />
    </div>
  );
};

export default Shows;
