
import TicketPurchaseComplete from '@/components/TicketPurchaseComplete';
import PerformersSection from '@/components/PerformersSection';
import NewsletterSignupSection from '@/components/NewsletterSignupSection';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import ShowTag from '@/components/ShowTag';
import MainCard from '@/components/MainCard';
import Header from '@/components/Header';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAdminShows } from '@/hooks/useAdminShows';
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';
import { MapPin, ArrowLeft } from 'lucide-react';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SubtleLoadingOverlay isVisible={true} />
      </div>
    );
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
      <div className="min-h-screen bg-[#FAFAFA]">
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
            {/* Back link positioned in bottom left of image */}
            <div className="absolute bottom-4 left-4">
              <Link 
                to="/shows" 
                className="inline-flex items-center text-white hover:text-white/80 transition-colors"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                <ArrowLeft size={24} className="mr-2" />
                Tillbaka till föreställningar
              </Link>
            </div>
          </div>

          {/* Overlapping card */}
          <div className="relative z-10 mx-0 md:mx-auto max-w-[1000px] -mt-16">
            <MainCard className="relative">            
              {/* Title and date */}
              <div>
                <h2>{formattedShow.title}</h2>
                <h3>{formatDateTime(formattedShow.date)}</h3>
              </div>

              {/* Location with map link */}
              <div>
                <h3 className="flex items-center">
                  <MapPin size={20} className="text-black mr-2" />
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
              <div className="mb-2">
                <h3>
                  {formattedShow.ticketPrice === 0 && formattedShow.discountPrice === 0 
                    ? '0 kr' 
                    : `${formattedShow.ticketPrice} kr / ${formattedShow.discountPrice} kr`
                  }
                </h3>
              </div>

              {/* Dashed line with centered tag */}
              <div className="mb-6 relative flex items-center">
                <div className="border-t-2 border-dashed border-gray-800 flex-1"></div>
                {show?.show_tag && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-100 px-2">
                    <ShowTag name={show.show_tag.name} color={show.show_tag.color} />
                  </div>
                )}
              </div>

              {/* Description */}
              {formattedShow.description && (
                <div className="mb-6">
                  <p dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(formattedShow.description) }} />
                </div>
              )}

              {/* Practical info */}
              {formattedShow.practicalInfo && formattedShow.practicalInfo.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Praktisk information</h3>
                  <div className="space-y-2">
                    {formattedShow.practicalInfo.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Newsletter signup section */}
              <NewsletterSignupSection onSignupClick={() => setIsNewsletterModalOpen(true)} />

              {/* Back to shows link */}
              <div className="mb-8">
                <Link 
                  to="/shows" 
                  className="inline-flex items-center text-black hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Tillbaka till föreställningar
                </Link>
              </div>

            </MainCard>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <NewsletterSignupModal 
        open={isNewsletterModalOpen} 
        onOpenChange={setIsNewsletterModalOpen} 
      />
    </>
  );
};

export default ShowDetails;
