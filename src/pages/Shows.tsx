
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShowCardFromStrapi from '@/components/ShowCardFromStrapi';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useShows } from '@/hooks/useStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';

const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: strapiData, isLoading, error } = useShows();

  // Fallback data in case Strapi is not available
  const fallbackShows = [
    {
      id: 1,
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      slug: "ensemble-27-oktober",
      image: "/lovable-uploads/a6436c99-8329-498f-b9f3-992e52f9cc8c.png",
      description: "En kväll med improvisationsteater med Lilla Improteaterns ensemble.",
      performers: [],
      practicalInfo: ["Dörrar öppnar 18:30", "Föreställningen börjar 19:00", "Entréavgift: 175kr"],
      mapLink: "https://maps.google.com",
      ticketPrice: 175,
      discountPrice: 145,
      availableTickets: 100
    },
    {
      id: 2,
      title: "Improviserad komedi",
      date: "15 november 20.00",
      location: "Teater Galeasen",
      slug: "improkomedi-15-november",
      image: "/lovable-uploads/bb88dac3-ab0d-45c0-80a4-1442060598be.png",
      description: "En kväll fylld med improviserad komedi.",
      performers: [],
      practicalInfo: ["Dörrar öppnar 19:30", "Föreställningen börjar 20:00", "Entréavgift: 175kr"],
      mapLink: "https://maps.google.com",
      ticketPrice: 175,
      discountPrice: 145,
      availableTickets: 100
    },
    {
      id: 3,
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      slug: "julspecial-8-december",
      image: "/lovable-uploads/c4cb950f-fa49-4fc8-ad5e-96402ad423f2.png",
      description: "En speciell julföreställning med improviserad komedi.",
      performers: [],
      practicalInfo: ["Dörrar öppnar 18:00", "Föreställningen börjar 18:30", "Entréavgift: 175kr"],
      mapLink: "https://maps.google.com",
      ticketPrice: 175,
      discountPrice: 145,
      availableTickets: 100
    }
  ];

  let shows = fallbackShows;
  let showStrapi = false;
  
  if (strapiData?.data && strapiData.data.length > 0) {
    console.log('Using Strapi shows data:', strapiData);
    shows = strapiData.data.map(formatStrapiShow).filter(Boolean);
    showStrapi = true;
  }

  if (error) {
    console.error('Error loading shows from Strapi:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Föreställningar
          </h1>
          {isLoading && (
            <p className="text-theatre-light/80">Laddar föreställningar...</p>
          )}
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          {showStrapi ? (
            // Show Strapi data as ShowCards
            <div className="grid gap-6 mb-6 md:grid-cols-1 lg:grid-cols-2 auto-rows-fr">
              {shows.map((show) => (
                <ShowCardFromStrapi key={show.id} show={show} />
              ))}
            </div>
          ) : (
            // Show fallback data as links to detail pages
            <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {shows.map((show) => (
                <Link key={show.id} to={`/shows/${show.slug}`} className="block">
                  <div className="border-4 border-white bg-white rounded-none p-0 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                    <div className="w-full h-48 flex-shrink-0">
                      <img 
                        src={show.image} 
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                      <h2 className="text-blue-500 font-bold text-lg mb-1">
                        {show.title} {show.date}
                      </h2>
                      <div className="flex items-center mb-3">
                        <MapPin size={16} className="text-red-800 mr-2" />
                        <p className="text-red-800">{show.location}</p>
                      </div>
                      <div className="text-blue-500 group-hover:text-blue-700 transition-colors mt-auto">
                        <span className="text-sm">Läs mer →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shows;
