
import Header from '@/components/Header';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowInfo from '@/components/ShowInfo';
import TicketPurchaseComplete from '@/components/TicketPurchaseComplete';
import PerformersSection from '@/components/PerformersSection';
import OtherShowsSection from '@/components/OtherShowsSection';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAdminShows } from '@/hooks/useAdminShows';
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';

const ShowDetails = () => {
  const { slug } = useParams();

  // Scroll to top when slug changes (navigating to another show)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Use admin shows hook
  const { data: allShowsData, isLoading, error } = useAdminShows();

  // Find the specific show by slug and format for components
  const show = allShowsData?.find(s => s.slug === slug);
  const otherShows = allShowsData?.filter(s => s.slug !== slug) || [];

  // Format show for component compatibility
  const formattedShow = show ? {
    title: show.title,
    slug: show.slug,
    date: show.show_date + 'T' + show.show_time,
    location: show.venue,
    mapLink: show.venue_maps_url,
    description: show.description,
    ticketPrice: show.regular_price,
    discountPrice: show.discount_price,
    totalTickets: show.max_tickets || 100,
    performers: show.performers.map(p => ({
      id: parseInt(p.id.slice(-8), 16),
      name: p.name,
      image: p.image_url,
      bio: p.bio || ''
    })),
    practicalInfo: show.venue_address ? [show.venue_address] : []
  } : null;

  const formattedOtherShows = otherShows.map(s => ({
    id: parseInt(s.id.slice(-8), 16),
    title: s.title,
    date: s.show_date + 'T' + s.show_time,
    time: s.show_time,
    location: s.venue,
    slug: s.slug,
    image: s.image_url || '',
    totalTickets: s.max_tickets || 100
  }));

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

  if (!formattedShow) {
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
              title={formattedShow.title}
              date={formattedShow.date}
              location={formattedShow.location}
              mapLink={formattedShow.mapLink}
              description={formattedShow.description}
            />
            
            {formattedShow.practicalInfo && formattedShow.practicalInfo.length > 0 && (
              <div className="mb-6">
                <div className="text-content-primary font-bold mb-3">Praktisk information</div>
                <div className="space-y-2">
                  {formattedShow.practicalInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-color-primary rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-content-secondary text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={formattedShow.performers && formattedShow.performers.length > 0 ? 'mb-8' : ''}>
              <TicketPurchaseComplete
                onPurchase={() => {}} // Not used anymore, handled internally
                ticketPrice={formattedShow.ticketPrice}
                discountPrice={formattedShow.discountPrice}
                totalTickets={formattedShow.totalTickets}
                showSlug={formattedShow.slug}
                showTitle={formattedShow.title}
                showDate={formattedShow.date}
                showLocation={formattedShow.location}
              />
            </div>
            
            {formattedShow.performers && formattedShow.performers.length > 0 && (
              <PerformersSection performers={formattedShow.performers} />
            )}
          </div>
          
          <OtherShowsSection shows={formattedOtherShows} />
        </div>
      </section>
    </div>
  );
};

export default ShowDetails;
