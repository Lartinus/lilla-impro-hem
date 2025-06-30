
import Header from '@/components/Header';
import ShowCardFromStrapi from '@/components/ShowCardFromStrapi';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import { useOptimizedShows } from '@/hooks/useOptimizedStrapi';
import { formatStrapiShow, sortShows } from '@/utils/strapiHelpers';
import { useEffect, useMemo, useState } from 'react';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';

const Shows = () => {
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error, refetch } = useOptimizedShows();

  const handleRetry = async () => {
    console.log('Retrying shows fetch...');
    setRetryCount(prev => prev + 1);
    try {
      await refetch();
      toast({
        title: "Uppdaterat",
        description: "Föreställningarna har laddats om.",
      });
    } catch (err) {
      console.error('Retry failed:', err);
      toast({
        title: "Fel",
        description: "Kunde fortfarande inte ladda föreställningarna. Försök igen senare.",
        variant: "destructive",
      });
    }
  };

  console.log('Shows page - Data:', data);
  console.log('Shows page - Error:', error);
  console.log('Shows page - Loading:', isLoading);

  const shows = useMemo(() => {
    if (!data) return [];
    
    try {
      const formattedShows = data?.data ? data.data.map(formatStrapiShow).filter(Boolean) : [];
      const sortedShows = sortShows(formattedShows);
      return sortedShows;
    } catch (err) {
      console.error('Error formatting shows:', err);
      return [];
    }
  }, [data]);

  console.log('Formatted shows:', shows);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 flex-1">
          <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            {[...Array(4)].map((_, index) => (
              <ShowCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    console.error('Error loading shows:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-md">
            <h2 className="text-2xl font-bold mb-4">Föreställningar kunde inte laddas</h2>
            <p className="text-lg mb-6">Det verkar som att det är problem med att ladda föreställningarna just nu.</p>
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="bg-accent-color-primary hover:bg-accent-color-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Försök igen {retryCount > 0 && `(${retryCount + 1})`}
              </button>
              <p className="text-sm opacity-75">
                Om problemet kvarstår, kontakta oss via info@improteatern.se
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/shows_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {shows.length > 0 ? (
            shows.map((show, index) => (
              <ShowCardFromStrapi 
                key={show.id || index} 
                show={show}
              />
            ))
          ) : (
            <div className="col-span-2 text-center text-white text-xl">
              Vi har inga föreställningar planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida föreställningar.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shows;
