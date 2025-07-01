
import Header from '@/components/Header';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowInfo from '@/components/ShowInfo';
import TicketPurchase from '@/components/TicketPurchase';
import PurchaseForm from '@/components/PurchaseForm';
import PerformersSection from '@/components/PerformersSection';
import OtherShowsSection from '@/components/OtherShowsSection';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { useOptimizedShows } from '@/hooks/useOptimizedStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';
import { Loader } from 'lucide-react';
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';
import { useImageLoader } from '@/hooks/useImageLoader';

const ShowDetails = () => {
  const { slug } = useParams();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseTickets, setPurchaseTickets] = useState({ regular: 0, discount: 0, code: '' });

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

  // Extract image URLs for loading tracking
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (show?.image) urls.push(show.image);
    otherShows.forEach(otherShow => {
      if (otherShow.image) urls.push(otherShow.image);
    });
    console.log('ShowDetails image URLs:', urls);
    return urls;
  }, [show, otherShows]);

  const { handleImageLoad, allImagesLoaded } = useImageLoader(imageUrls);
  const showLoadingOverlay = isLoading || (!allImagesLoaded && imageUrls.length > 0);

  console.log('ShowDetails - Images loaded:', allImagesLoaded, 'Show loading overlay:', showLoadingOverlay);

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

  const handlePurchase = (data: { regularTickets: number; discountTickets: number; discountCode: string }) => {
    setPurchaseTickets({ regular: data.regularTickets, discount: data.discountTickets, code: data.discountCode });
    setShowPurchaseForm(true);
  };

  const handleCompletePurchase = () => {
    setShowPurchaseForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
      <Header />
      <SubtleLoadingOverlay isVisible={showLoadingOverlay} />
      
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
            
            {!showPurchaseForm ? (
              <TicketPurchase 
                onPurchase={handlePurchase}
                ticketPrice={show.ticketPrice}
                discountPrice={show.discountPrice}
                availableTickets={show.availableTickets}
              />
            ) : (
              <PurchaseForm 
                ticketCount={purchaseTickets.regular}
                discountTickets={purchaseTickets.discount}
                discountCode={purchaseTickets.code}
                showTitle={show.title}
                ticketPrice={show.ticketPrice}
                discountPrice={show.discountPrice}
                onBack={() => setShowPurchaseForm(false)}
                onComplete={handleCompletePurchase}
              />
            )}
            
            {show.performers && show.performers.length > 0 && (
              <PerformersSection performers={show.performers} />
            )}
          </div>
          
          <OtherShowsSection shows={otherShows} onImageLoad={handleImageLoad} />
        </div>
      </section>
    </div>
  );
};

export default ShowDetails;
