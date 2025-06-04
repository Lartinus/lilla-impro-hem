
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShowCardSimple from '@/components/ShowCardSimple';
import { useEffect } from 'react';
import { useShows } from '@/hooks/useStrapi';
import { formatStrapiShowSimple } from '@/utils/strapiHelpers';

const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: strapiData, isLoading, error } = useShows();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
        <Header />
        
        <section className="px-0.5 md:px-4 mt-32 py-6 animate-fade-in">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
              Föreställningar
            </h1>
            <p className="text-theatre-light/80">Laddar föreställningar...</p>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Error loading shows from Strapi:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
        <Header />
        
        <section className="px-0.5 md:px-4 mt-32 py-6 animate-fade-in">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
              Föreställningar
            </h1>
            <p className="text-theatre-light/80">Ett fel uppstod vid laddning av föreställningar.</p>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Format shows from Strapi using simple format (only basic info)
  const shows = strapiData?.data ? strapiData.data.map(formatStrapiShowSimple).filter(Boolean) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero - moved down from mt-20 to mt-32 */}
      <section className="px-0.5 md:px-4 mt-32 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Föreställningar
          </h1>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-6xl md:mx-auto">
          {shows.length > 0 ? (
            <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map((show) => (
                <ShowCardSimple key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <div className="text-center text-theatre-light/80">
              <p>Inga föreställningar tillgängliga för tillfället.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shows;
