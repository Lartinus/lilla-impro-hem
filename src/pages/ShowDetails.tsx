import Header from '@/components/Header';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowInfo from '@/components/ShowInfo';
import TicketPurchase from '@/components/TicketPurchase';
import PurchaseForm from '@/components/PurchaseForm';
import PerformersSection from '@/components/PerformersSection';
import OtherShowsSection from '@/components/OtherShowsSection';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useShow, useShows } from '@/hooks/useStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';
import { Loader } from 'lucide-react';

const ShowDetails = () => {
  const { slug } = useParams();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseTickets, setPurchaseTickets] = useState({ regular: 0, discount: 0, code: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: showData, isLoading: showLoading, error } = useShow(slug || '');
  const { data: allShowsData } = useShows();

  const showDataFromStrapi = showData?.data?.[0] ? formatStrapiShow(showData.data[0]) : null;
  
  // Use Strapi data if available, otherwise show error
  const show = showDataFromStrapi || {
    title: "Föreställning hittades inte",
    date: "",
    location: "",
    description: "Denna föreställning kunde inte hittas.",
    performers: [],
    practicalInfo: [],
    mapLink: "",
    ticketPrice: 150,
    discountPrice: 120,
    availableTickets: 50
  };

  const allShows = allShowsData?.data?.map(formatStrapiShow).filter(Boolean) || [];
  const otherShows = allShows.filter(s => s.slug !== slug);

  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="pt-32 text-center flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (error || !showDataFromStrapi) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="pt-32 text-center flex-1 flex items-center justify-center">
          <div>
            <h1 className="text-2xl">Föreställning hittades inte</h1>
            <p className="mt-4 text-theatre-light/80">
              {error ? 'Ett fel uppstod vid laddning av föreställningen.' : 'Denna föreställning existerar inte.'}
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
            
            {/* Practical Info - inlined with consistent styling */}
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
          
          <OtherShowsSection shows={otherShows} />
        </div>
      </section>
    </div>
  );
};

export default ShowDetails;
