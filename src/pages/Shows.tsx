
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAdminShows, formatAdminShowForCard } from '@/hooks/useAdminShows';
import { useShowTags } from '@/hooks/useShowTags';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowTag from '@/components/ShowTag';
import MainCard from '@/components/MainCard';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
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
  
  // Check if we should show loading overlay
  const shouldShowLoading = showsLoading || tagsLoading || (shows.length > 0 && !allImagesLoaded);

  if (shouldShowLoading) {
    return (
      <>
        <Header />
        <SimpleParallaxHero 
          imageSrc="/uploads/images/shows_2024.jpg"
        />
        <SubtleLoadingOverlay isVisible={true} />
        <Footer />
      </>
    );
  }

  if (showsError) {
    return (
      <>
        <Header />
        <SimpleParallaxHero 
          imageSrc="/uploads/images/shows_2024.jpg"
        />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Kunde inte ladda föreställningar</h2>
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
      
      <SimpleParallaxHero 
        imageSrc="/uploads/images/shows_2024.jpg"
      />
      
      <SubtleLoadingOverlay isVisible={shouldShowLoading} />

      <div className="container mx-auto px-4 py-8">
        <MainCard>
          {/* Om våra föreställningar */}
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-6 font-satoshi">Om våra föreställningar</h1>
            <p className="text-[16px] font-satoshi mb-6">
              Hos oss kan du se högkvalitativ impro från vår ensemble, avancerade kursare (house teams), 
              kursuppspel från våra baskurser eller gästspel från grupper som vi bjudit in. 
              För tydlighetens skull markerar vi alltid våra föreställningar med någon av följande tags
            </p>
            
            {showTags && showTags.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-8">
                {showTags.map((tag) => (
                  <div key={tag.id} className="flex flex-col items-center gap-2">
                    <ShowTag name={tag.name} color={tag.color} size="large" />
                    {tag.description && (
                      <p className="text-sm text-gray-600 text-center max-w-[120px] font-satoshi">
                        {tag.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Aktuella föreställningar */}
          <section className="mb-12">
            <h1 className="text-3xl font-bold mb-8 font-satoshi">Aktuella Föreställningar</h1>
            
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
                <h2 className="text-xl font-semibold mb-4 font-satoshi">Inga föreställningar just nu</h2>
                <p className="text-gray-600 mb-6 font-satoshi">
                  Vi har inga föreställningar inplanerade för tillfället. Håll utkik för kommande evenemang!
                </p>
              </div>
            )}
          </section>
        </MainCard>

        {/* Newsletter signup section - gray box */}
        <div className="w-full bg-[#D9D9D9] -mx-6 md:-mx-8">
          <div className="px-6 md:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 font-satoshi">Få informationen direkt i din inkorg</h1>
              <p className="text-[16px] font-satoshi mb-6">
                Prenumerera på vårt nyhetsbrev och få information om nya föreställningar direkt till din inkorg.
              </p>
              <Button 
                onClick={() => setIsNewsletterModalOpen(true)}
                className="bg-accent-color hover:bg-accent-hover text-white font-satoshi"
              >
                Prenumerera på nyhetsbrev
              </Button>
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
