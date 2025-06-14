import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';
const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Single query for shows data
  const {
    data: strapiData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.functions.invoke('strapi-shows');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
    // 10 minutes - longer cache for shows
    gcTime: 30 * 60 * 1000,
    // 30 minutes
    retry: 2,
    // Only retry twice
    refetchOnWindowFocus: false // Don't refetch on window focus
  });

  // Memoize the formatted shows to avoid recalculating on every render
  const shows = useMemo(() => {
    return strapiData?.data ? strapiData.data.map(formatStrapiShowSimple).filter(Boolean) : [];
  }, [strapiData]);
  if (error) {
    console.error('Error loading shows from Strapi:', error);
    return <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
        <Header />
        
        <section className="px-0.5 md:px-4 mt-16 py-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
              Föreställningar
            </h1>
            <p className="text-theatre-light/80">Ett fel uppstod vid laddning av föreställningar. Försök igen! </p>
          </div>
        </section>

        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="md:px-4 mt-24 md:mt-32 md:py-6 px-0 mx-0 my-0 py-px">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Föreställningar
          </h1>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-6xl md:mx-auto">
          {isLoading ? <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {[...Array(6)].map((_, index) => <ShowCardSkeleton key={index} />)}
            </div> : shows.length > 0 ? <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map(show => <ShowCardSimple key={`show-${show.id}-${show.slug}`} show={show} />)}
            </div> : <div className="text-center text-theatre-light/80">
              <p>Vi har inga föreställningar ute just nu. Kom gärna tillbaka senare!</p>
            </div>}
        </div>
      </section>

      {/* <Footer /> */}
    </div>;
};
export default Shows;
