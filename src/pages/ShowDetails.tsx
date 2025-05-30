
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowInfo from '@/components/ShowInfo';
import PracticalInfo from '@/components/PracticalInfo';
import TicketPurchase from '@/components/TicketPurchase';
import PurchaseForm from '@/components/PurchaseForm';
import PerformersSection from '@/components/PerformersSection';
import OtherShowsSection from '@/components/OtherShowsSection';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useShow, useShows } from '@/hooks/useStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';

const ShowDetails = () => {
  const { slug } = useParams();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseTickets, setPurchaseTickets] = useState({ regular: 0, discount: 0, code: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: showData, isLoading: showLoading } = useShow(slug || '');
  const { data: allShowsData } = useShows();

  const performers = [
    {
      id: 1,
      name: "Hjalmar Hardestam",
      image: "/lovable-uploads/192352b9-7e67-447a-aa36-9b17372a4155.png",
      bio: "Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramaverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler – bland annat i Amsterdam, Edinburgh och Nottingham – och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London."
    },
    {
      id: 2,
      name: "Ellen Bobeck",
      image: "/lovable-uploads/df0cb53d-072e-4970-b9fa-e175209d1cf7.png",
      bio: "Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med trion Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM – där hon kombinerar musikalisk känsla med improviserat berättande."
    },
    {
      id: 3,
      name: "David Rosenqvist",
      image: "/lovable-uploads/5cb42dd8-59bc-49e4-ae83-9bb0da74f658.png",
      bio: "David började med improvisationsteater 2013 och har sedan dess varit en aktiv del av improscenerna i Karlstad, Örebro och Stockholm. Han var med och startade Dramaverket 2014 och senare Spinoff 2021. I dag spelar han både med Dramaverket och Floden STHLM, och gästar under våren 2025 även Stockholm Improvisationsteater. Till vardags jobbar David som producent inom event och teater – med ett öga för struktur, sammanhang och att få saker att hända."
    }
  ];

  const showDataFromStrapi = showData?.data?.[0] ? formatStrapiShow(showData.data[0]) : null;
  
  // Use Strapi data if available, otherwise fall back to hardcoded data
  const show = showDataFromStrapi || {
    title: "Föreställning hittades inte",
    date: "",
    location: "",
    description: "Denna föreställning kunde inte hittas.",
    performers: [],
    practicalInfo: [],
    mapLink: "",
    ticketPrice: 175,
    discountPrice: 145,
    availableTickets: 100
  };

  const allShows = allShowsData?.data?.map(formatStrapiShow).filter(Boolean) || [];
  const otherShows = allShows.filter(s => s.slug !== slug);

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="text-2xl">Laddar...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  if (!show.title || show.title === "Föreställning hittades inte") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <Header />
        <div className="pt-32 text-center">
          <h1 className="text-2xl">Föreställning hittades inte</h1>
        </div>
        <Footer />
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
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      <ShowDetailsHeader showsUrl="/shows" />

      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            <ShowInfo 
              title={show.title}
              date={show.date}
              location={show.location}
              mapLink={show.mapLink}
              description={show.description}
            />
            
            <PracticalInfo practicalInfo={show.practicalInfo} />
            
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
                onBack={() => setShowPurchaseForm(false)}
                onComplete={handleCompletePurchase}
              />
            )}
            
            <PerformersSection performers={show.performers.length > 0 ? show.performers : performers} />
          </div>
          
          <OtherShowsSection shows={otherShows} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShowDetails;
