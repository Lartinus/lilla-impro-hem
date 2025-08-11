
import TicketPurchaseComplete from '@/components/TicketPurchaseComplete';
import PerformersSection from '@/components/PerformersSection';
import NewsletterSignupSection from '@/components/NewsletterSignupSection';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';

import OptimizedImage from '@/components/OptimizedImage';
import ShowTag from '@/components/ShowTag';
import MainCard from '@/components/MainCard';
import Header from '@/components/Header';
import ShowDetailsSkeleton from '@/components/skeletons/ShowDetailsSkeleton';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAdminShows } from '@/hooks/useAdminShows';

import { MapPin, MoveLeft } from 'lucide-react';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { formatPriceSEK } from '@/lib/utils';

const ShowDetails = () => {
  const { slug } = useParams();
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

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
    ticketPrice: show.regular_price, // values stored in kronor in admin_shows
    discountPrice: show.discount_price, // values stored in kronor in admin_shows
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

  const formatDateTime = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', { month: 'long' });
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
      
      return `${day} ${month} ${timeStr}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <ShowDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl text-black mb-4">Ett fel uppstod</h1>
          <p className="text-gray-600">
            Kunde inte ladda föreställningarna. Försök igen senare.
          </p>
        </div>
      </div>
    );
  }

  if (!formattedShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl text-black mb-4">Föreställning hittades inte</h1>
          <p className="text-gray-600">
            Denna föreställning existerar inte eller har tagits bort.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#FAFAFA]">
        {/* Image with overlapping card */}
        <div className="relative mt-20">
          {/* Large full-width image */}
          <div className="w-full h-[280px] relative">
            <OptimizedImage
              src={show?.image_url}
              alt={formattedShow.title}
              className="w-full h-full object-cover"
              fallbackText="Ingen bild"
            />
          </div>

          {/* Overlapping card */}
          <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
            <MainCard className="relative">            
              {/* Back link positioned above content, aligned with text */}
              <div className="absolute -top-8 left-6 md:left-8 z-20">
                <Link 
                  to="/forestallningar" 
                  className="inline-flex items-center hover:opacity-80 transition-colors"
                  style={{ color: 'rgb(var(--white))', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  <MoveLeft size={24} className="mr-2" />
                  Tillbaka till föreställningar
                </Link>
              </div>
              
              {/* Title and date */}
              <div className="mb-0">
                <h2>{formattedShow.title}</h2>
                <h3>{formatDateTime(formattedShow.date)}</h3>
              </div>

              {/* Location with map link */}
              <div className="mb-0">
                <h3 className="flex items-center">
                  <MapPin size={20} className="text-black mr-1" />
                  <a 
                    href={formattedShow.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {formattedShow.location}
                  </a>
                </h3>
              </div>

              {/* Ticket prices */}
              <div className="mb-3">
                <h3>
                  {formattedShow.ticketPrice === 0 && formattedShow.discountPrice === 0 
                    ? '0 kr' 
                    : `${formatPriceSEK(formattedShow.ticketPrice)} / ${formatPriceSEK(formattedShow.discountPrice)}`
                  }
                </h3>
              </div>

              {/* Dashed line with centered tags */}
              <div className="mb-6 relative flex items-center">
                <div className="border-t-2 border-dashed border-gray-800 flex-1"></div>
                {show?.show_tags && show.show_tags.length > 0 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-100 px-2 flex gap-2 flex-wrap items-center justify-center">
                    {show.show_tags.map((t) => (
                      <ShowTag key={t.id} name={t.name} color={t.color} />
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
                <div className="mb-6">
                  <p dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml((formattedShow.description && formattedShow.description.trim() !== '') ? formattedShow.description : "Mer info kommer snart.") }} />
                </div>


              {/* Ticket purchase section */}
              <div className="mb-12">
                <TicketPurchaseComplete
                  onPurchase={() => {}}
                  ticketPrice={formattedShow.ticketPrice}
                  discountPrice={formattedShow.discountPrice}
                  totalTickets={formattedShow.totalTickets}
                  showSlug={formattedShow.slug}
                  showTitle={formattedShow.title}
                  showDate={formattedShow.date}
                  showLocation={formattedShow.location}
                />
              </div>

              {/* Performers section */}
              {formattedShow.performers && formattedShow.performers.length > 0 && (
                <div className="mb-8">
                  <PerformersSection performers={formattedShow.performers} title="MEDVERKANDE" />
                </div>
              )}

              {/* Back to shows link */}
              <div className="mb-8">
                <Link 
                  to="/forestallningar" 
                  className="inline-flex items-center text-black hover:text-black/80 transition-colors"
                >
                  <MoveLeft size={24} className="mr-2" />
                  Tillbaka till föreställningar
                </Link>
              </div>

              {/* Newsletter signup section */}
              <NewsletterSignupSection onSignupClick={() => setIsNewsletterModalOpen(true)} />

            </MainCard>
          </div>
        </div>
      </div>
      
      <NewsletterSignupModal 
        open={isNewsletterModalOpen} 
        onOpenChange={setIsNewsletterModalOpen} 
      />
    </>
  );
};

export default ShowDetails;
