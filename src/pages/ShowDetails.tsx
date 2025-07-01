
import Header from '@/components/Header';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowInfo from '@/components/ShowInfo';
import TicketPurchaseComplete from '@/components/TicketPurchaseComplete';
import PerformersSection from '@/components/PerformersSection';
import OtherShowsSection from '@/components/OtherShowsSection';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useOptimizedShows } from '@/hooks/useOptimizedStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';

const ShowDetails = () => {
  const { slug } = useParams();

  // Scroll to top when slug changes (navigating to another show)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Use optimized hooks for better performance
  const { data: allShowsData, isLoading, error } = useOptimizedShows();

  // Find the specific show by slug
  const allShows = allShowsData?.data?.map(formatStrapiShow).filter(Boolean) || [];
  const show = allShows.find(s => s.slug === slug);
  const otherShows = allShows.filter(s => s.slug !== slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <SubtleLoadingOverlay isVisible={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="pt-32 text-center flex-1 flex items-center justify-center">
          <div>
            <h1 className="text-2xl text-white">Ett fel uppstod</h1>
            <p className="mt-4 text-theatre-light/80">
              Kunde inte ladda föreställningarna. Försök igen senare.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="pt-32 text-center flex-1 flex items-center justify-center">
          <div>
            <h1 className="text-2xl text-white">Föreställning hittades inte</h1>
            <p className="mt-4 text-theatre-light/80">
              Denna föreställning existerar inte eller har tagits bort.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
      <Header />
      
      <ShowDetailsHeader showsUrl="/shows" />

      <section className="py-2 px-0.5 md:px-4 pb-8 flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            <ShowInfo 
              title={show.title}
              date={show.date}
              location={show.location}
              mapLink={show.mapLink}
              description={show.description}
            />
            
            {show.practicalInfo && show.practicalInfo.length > 0 && (
              <div className="mb-6">
                <div className="text-content-primary font-bold mb-3">Praktisk information</div>
                <div className="space-y-2">
                  {show.practicalInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-color-primary rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-content-secondary text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <TicketPurchaseComplete
              onPurchase={() => {}} // Not used anymore, handled internally
              ticketPrice={show.ticketPrice}
              discountPrice={show.discountPrice}
              totalTickets={show.availableTickets}
              showSlug={show.slug}
              showTitle={show.title}
              showDate={show.date}
              showLocation={show.location}
            />
            
            {show.performers && show.performers.length > 0 && (
              <PerformersSection performers={show.performers} />
            )}
          </div>
          
          <OtherShowsSection shows={otherShows} />
        </div>
      </section>
    </div>
  );
};

export default ShowDetails;
