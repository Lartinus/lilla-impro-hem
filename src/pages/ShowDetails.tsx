
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

const ShowDetails = () => {
  const { slug } = useParams();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseTickets, setPurchaseTickets] = useState({ regular: 0, discount: 0, code: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const allShows = [
    {
      id: 1,
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      slug: "ensemble-27-oktober",
      image: "/lovable-uploads/a6436c99-8329-498f-b9f3-992e52f9cc8c.png"
    },
    {
      id: 2,
      title: "Improviserad komedi",
      date: "15 november 20.00", 
      location: "Teater Galeasen",
      slug: "improkomedi-15-november",
      image: "/lovable-uploads/bb88dac3-ab0d-45c0-80a4-1442060598be.png"
    },
    {
      id: 3,
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      slug: "julspecial-8-december",
      image: "/lovable-uploads/c4cb950f-fa49-4fc8-ad5e-96402ad423f2.png"
    }
  ];

  const showData: { [key: string]: any } = {
    'ensemble-27-oktober': {
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      mapLink: "https://maps.google.com/?q=Metropole+Mäster+Samuelsgatan+1+Stockholm",
      description: "Lilla Improteaterns ensemble ger er några av Sveriges bästa improvisatörer.\n\nFöreställningen är helt improviserad, vilket innebär att inget är förberett och allt skapas i stunden, inspirerat av publikens idéer. Du får uppleva karaktärer, relationer och situationer som växer fram mitt framför ögonen på dig – från vardagskaos till drömlika världar.\n\nImprov comedy är en teaterform där skådespelarna arbetar utan manus, men med tydliga verktyg och starkt samspel. Resultatet? En kväll fylld med skratt, igenkänning och överraskningar.\n\nTa med kollegorna, vännerna eller dejten. Beställ något gott från baren, luta dig tillbaka och låt dig svepas med.",
      performers: performers,
      practicalInfo: [
        "Dörrar: 18.00",
        "Förställningens början: 19.00",
        "Längd: 2 timmar inkl. 20 min paus",
        "Plats: Metropole, Mäster Samuelsgatan 1, Stockholm"
      ]
    },
    'improkomedi-15-november': {
      title: "Improviserad komedi",
      date: "15 november 20.00",
      location: "Teater Galeasen",
      mapLink: "https://maps.google.com/?q=Teater+Galeasen+Stockholm",
      description: "En kväll fylld med spontan humor och kreativitet när våra improvisatörer skapar magi på scenen.\n\nVarje föreställning är unik eftersom allt skapas här och nu, baserat på publikens förslag och idéer. Vi blandar klassiska improformat med experimentella tekniker för att ge er en upplevelse ni sent kommer att glömma.\n\nKom och var med och skapa historier tillsammans med oss. Denna kväll blir aldrig densamma igen!",
      performers: [performers[0], performers[1]],
      practicalInfo: [
        "Dörrar: 19.00",
        "Förställningens början: 20.00",
        "Längd: 1,5 timmar inkl. 15 min paus",
        "Plats: Teater Galeasen, Stockholm"
      ]
    },
    'julspecial-8-december': {
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      mapLink: "https://maps.google.com/?q=Södra+Teatern+Stockholm",
      description: "En festlig kväll med improviserad komedi inför julen!\n\nVi blandar traditionell improvisation med julstämning och skapar tillsammans med publiken berättelser som värmer hjärtat. Förvänta dig allt från absurda julsagor till vardagskomik med pepparkaksdoft.\n\nPerfekt för personalfest, date night eller bara för att skratta bort november-mörkret. Glögg serveras i foajén!",
      performers: performers,
      practicalInfo: [
        "Dörrar: 17.30",
        "Förställningens början: 18.30",
        "Längd: 2 timmar inkl. 20 min paus",
        "Plats: Södra Teatern, Stockholm",
        "OBS: Glögg serveras i foajén från kl 17.30"
      ]
    }
  };

  const show = showData[slug || ''];
  const otherShows = allShows.filter(s => s.slug !== slug);

  if (!show) {
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
              <TicketPurchase onPurchase={handlePurchase} />
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
            
            <PerformersSection performers={show.performers} />
          </div>
          
          <OtherShowsSection shows={otherShows} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShowDetails;
