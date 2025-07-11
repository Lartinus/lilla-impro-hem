
import Header from '@/components/Header';
import ShowCardSimple from '@/components/ShowCardSimple';
import ShowCardSkeleton from '@/components/ShowCardSkeleton';
import { useAdminShows, formatAdminShowForCard } from '@/hooks/useAdminShows';
import { useEffect, useMemo, useState } from 'react';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';
import { useImageLoader } from '@/hooks/useImageLoader';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Mail } from 'lucide-react';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';

const Shows = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error, refetch } = useAdminShows();

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
      // Format admin shows for compatibility with ShowCardSimple
      const formattedShows = data.map(show => formatAdminShowForCard(show));
      
      console.log('📊 Admin shows:', formattedShows.map(s => ({ slug: s.slug, totalTickets: s.totalTickets })));
      return formattedShows;
    } catch (err) {
      console.error('Error formatting admin shows:', err);
      return [];
    }
  }, [data]);

  // Extract image URLs for loading tracking
  const imageUrls = useMemo(() => {
    const urls = shows.map(show => {
      if (!show.image) return null;
      // For admin shows, handle Supabase storage URLs directly
      const imageUrl = show.image?.data?.attributes?.url;
      if (imageUrl) {
        // Return the URL as-is since Supabase storage URLs are already complete
        return imageUrl;
      }
      return null;
    }).filter(Boolean) as string[];
    console.log('Shows: Extracted image URLs:', urls);
    return urls;
  }, [shows]);

  const { handleImageLoad, allImagesLoaded, loadedCount, totalCount } = useImageLoader(imageUrls);
  
  // Only show loading overlay if we're actually loading data OR if we have images that aren't loaded yet
  const showLoadingOverlay = isLoading || (imageUrls.length > 0 && !allImagesLoaded);

  console.log('Shows: Loading state -', {
    isLoading,
    imagesLoaded: allImagesLoaded,
    loadedCount,
    totalCount,
    showOverlay: showLoadingOverlay
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <SubtleLoadingOverlay isVisible={true} />
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
      <SubtleLoadingOverlay isVisible={showLoadingOverlay} />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {shows.length > 0 ? (
            shows.map((show, index) => (
              <ShowCardSimple 
                key={show.id || index} 
                show={show}
                onImageLoad={handleImageLoad}
              />
            ))
          ) : (
            <div className="col-span-2 flex justify-center">
              <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl p-8 max-w-lg text-center shadow-2xl">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Inga föreställningar just nu</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Vi har inga föreställningar planerade just nu. Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida föreställningar.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm" className="bg-background/50 hover:bg-background/70">
                    <Heart className="w-4 h-4 mr-2" />
                    Följ oss
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-background/50 hover:bg-background/70"
                    onClick={() => setNewsletterModalOpen(true)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Nyhetsbrev
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fast nyhetsbrevknapp under alla föreställningar */}
        {shows.length > 0 && (
          <div className="text-center mt-16 mx-[12px] md:mx-0">
            <div className="bg-background/95 backdrop-blur-md border border-border/50 p-6 max-w-md mx-auto shadow-2xl">
              <h3 className="text-lg font-semibold text-foreground mb-3">Missa inga föreställningar!</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Prenumerera på vårt nyhetsbrev och få information om nya föreställningar direkt till din inkorg.
              </p>
              <Button 
                onClick={() => setNewsletterModalOpen(true)}
                className="w-full bg-accent-text hover:bg-accent-hover"
              >
                <Mail className="w-4 h-4 mr-2" />
                Prenumerera på nyhetsbrev
              </Button>
            </div>
          </div>
        )}
      </section>

      <NewsletterSignupModal 
        open={newsletterModalOpen} 
        onOpenChange={setNewsletterModalOpen} 
      />
    </div>
  );
};

export default Shows;
