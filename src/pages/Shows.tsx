
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdminShows, formatAdminShowForCard } from '@/hooks/useAdminShows';
import { useShowTags } from '@/hooks/useShowTags';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowTag from '@/components/ShowTag';
import MainCard from '@/components/MainCard';

import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import { Button } from '@/components/ui/button';
import { useImageLoader } from '@/hooks/useImageLoader';
import { toast } from 'sonner';

export default function Shows() {
  const [retryCount, setRetryCount] = useState(0);
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const {
    data: adminShows,
    isLoading: showsLoading,
    isError: showsError,
    refetch: refetchShows
  } = useAdminShows();

  const { data: showTags, isLoading: tagsLoading } = useShowTags();

  const handleRetry = async () => {
    console.log('Retrying shows fetch...');
    setRetryCount(prev => prev + 1);
    try {
      await refetchShows();
      toast("Föreställningarna har laddats om.");
    } catch (err) {
      console.error('Retry failed:', err);
      toast("Kunde fortfarande inte ladda föreställningarna. Försök igen senare.");
    }
  };

  // Format shows for display
  const shows = useMemo(() => {
    if (!adminShows) return [];
    return adminShows.map(show => formatAdminShowForCard(show));
  }, [adminShows]);

  // Extract image URLs for loading tracking
  const imageUrls = useMemo(() => {
    return shows.map(show => show.image).filter(Boolean) as string[];
  }, [shows]);

  const { handleImageLoad, allImagesLoaded } = useImageLoader(imageUrls);
  
  // Check if we should show loading overlay - don't wait forever for images
  const shouldShowLoading = showsLoading || tagsLoading;

  if (shouldShowLoading) {
    return (
      <>
        <Header />
        {/* Hero Image */}
        <div className="h-[360px] relative overflow-hidden">
          <img 
            src="/uploads/images/shows_2024.jpg" 
            alt="" 
            className="w-full h-full object-cover object-center filter brightness-50"
          />
        </div>
        <SubtleLoadingOverlay isVisible={true} />
        <Footer />
      </>
    );
  }

  if (showsError) {
    return (
      <>
        <Header />
        {/* Hero Image */}
        <div className="h-[360px] relative overflow-hidden">
          <img 
            src="/uploads/images/shows_2024.jpg" 
            alt="" 
            className="w-full h-full object-cover object-center filter brightness-50"
          />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2>Kunde inte ladda föreställningar</h2>
            <p className="text-gray-600 mb-8">Det uppstod ett fel när föreställningarna skulle hämtas.</p>
            <Button onClick={handleRetry}>
              Försök igen
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {/* Hero Image */}
      <div className="h-[360px] relative overflow-hidden">
        <img 
          src="/uploads/images/shows_2024.jpg" 
          alt="" 
          className="w-full h-full object-cover object-center filter brightness-50"
        />
      </div>
      
      <SubtleLoadingOverlay isVisible={shouldShowLoading} />

      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[1000px] -mt-16">
          <div className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              {/* Om våra föreställningar */}
              <section>
                <h1>Om våra föreställningar</h1>
                <p className="text-[16px] font-satoshi mb-6">
                  Hos oss kan du se högkvalitativ impro från vår ensemble, avancerade kursare (house teams), 
                  kursuppspel från våra baskurser eller gästspel från grupper som vi bjudit in. 
                  För tydlighetens skull markerar vi alltid våra föreställningar med någon av följande tags
                </p>
                
                {showTags && showTags.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-8">
                    {showTags.map((tag) => (
                      <ShowTag key={tag.id} name={tag.name} color={tag.color} size="large" />
                    ))}
                  </div>
                )}
              </section>

              {/* Aktuella föreställningar */}
              <section>
                <h1>Aktuella Föreställningar</h1>
                
                {shows.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shows.map((show, index) => (
                      <ShowCardSimple 
                        key={show.id}
                        show={show}
                        onImageLoad={handleImageLoad}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2>Inga föreställningar just nu</h2>
                    <p className="text-gray-600 mb-6 font-satoshi">
                      Vi har inga föreställningar inplanerade för tillfället. Håll utkik för kommande evenemang!
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Newsletter signup section - gray box */}
            <div className="bg-[#D9D9D9] mx-0 mb-0 md:mx-[31px] md:mb-[30px]">
              <div className="px-6 md:px-8 py-8">
                <div className="text-left">
                  <h1>Få informationen direkt i din inkorg</h1>
                  <p className="text-[16px] font-satoshi mb-6">
                    Prenumerera på vårt nyhetsbrev och få information om nya föreställningar direkt till din inkorg.
                  </p>
                  <Button 
                    onClick={() => setIsNewsletterModalOpen(true)}
                    variant="default"
                  >
                    <span>Skriv upp dig</span>
                    <span className="text-2xl font-bold">→</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewsletterSignupModal 
        open={isNewsletterModalOpen}
        onOpenChange={setIsNewsletterModalOpen}
      />
      
      <Footer />
    </>
  );
}
