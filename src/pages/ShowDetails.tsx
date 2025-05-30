
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowLeft } from 'lucide-react';

const ShowDetails = () => {
  const { slug } = useParams();
  const [ticketCount, setTicketCount] = useState(1);
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });

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

  // Use the same shows data as in Shows.tsx
  const allShows = [
    {
      id: 1,
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      slug: "ensemble-27-oktober",
      image: "/lovable-uploads/ac906279-978d-4e9c-b9a1-eb3a90b48aef.png"
    },
    {
      id: 2,
      title: "Improviserad komedi",
      date: "15 november 20.00", 
      location: "Teater Galeasen",
      slug: "improkomedi-15-november",
      image: "/lovable-uploads/a018eb4f-8f59-4895-b9b0-565c2b8ad636.png"
    },
    {
      id: 3,
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      slug: "julspecial-8-december",
      image: "/lovable-uploads/8c70d3b3-4ad3-4d2d-a831-b759a5ec35eb.png"
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

  const handlePurchase = () => {
    if (ticketCount === 0 && discountTickets === 0) return;
    setShowPurchaseForm(true);
  };

  const handleCompletePurchase = () => {
    console.log('Purchase data:', {
      ...purchaseData,
      regularTickets: ticketCount,
      discountTickets: discountTickets,
      discountCode: discountCode,
      show: show.title
    });
    alert('Köp genomfört! (Stripe-integration kommer här)');
    setShowPurchaseForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <Link to="/shows" className="inline-flex items-center text-theatre-light/80 hover:text-theatre-light mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Tillbaka till föreställningar
          </Link>
        </div>
      </section>

      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            <h2 className="text-blue-500 font-bold text-xl mb-4">
              <span className="block md:hidden">{show.title}</span>
              <span className="hidden md:block">{show.title} {show.date}</span>
            </h2>
            <div className="block md:hidden text-blue-500 font-bold text-lg mb-4">{show.date}</div>
            
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <MapPin size={16} className="text-theatre-secondary mr-2" />
                <h3 className="text-theatre-secondary font-medium">
                  <a 
                    href={show.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {show.location}
                  </a>
                </h3>
              </div>
            </div>
            
            <div className="text-gray-700 leading-relaxed mb-6 text-base" style={{ lineHeight: '1.3' }}>
              {show.description.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mb-6">
              <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
              <div className="space-y-2">
                {show.practicalInfo.map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {!showPurchaseForm ? (
              <div className="mb-6">
                <h4 className="text-gray-800 font-bold mb-4">Köp biljetter</h4>
                
                <div className="bg-gray-50 p-4 rounded-none border border-gray-300 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-800 font-medium">Pris 175kr</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
                        className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{ticketCount}</span>
                      <button
                        onClick={() => setTicketCount(ticketCount + 1)}
                        className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      placeholder="Ev. rabattkod"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="rounded-none border-gray-300"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-none border border-gray-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">Student/pensionär 145kr</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
                        className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{discountTickets}</span>
                      <button
                        onClick={() => setDiscountTickets(discountTickets + 1)}
                        className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePurchase}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-sm"
                  disabled={ticketCount === 0 && discountTickets === 0}
                >
                  Fortsätt →
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-gray-800 font-bold mb-4">Slutför köp</h4>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                    <Input
                      value={purchaseData.name}
                      onChange={(e) => setPurchaseData({...purchaseData, name: e.target.value})}
                      className="rounded-none"
                      placeholder="Ditt namn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                    <Input
                      type="email"
                      value={purchaseData.email}
                      onChange={(e) => setPurchaseData({...purchaseData, email: e.target.value})}
                      className="rounded-none"
                      placeholder="din@email.se"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
                    <Input
                      type="tel"
                      value={purchaseData.phone}
                      onChange={(e) => setPurchaseData({...purchaseData, phone: e.target.value})}
                      className="rounded-none"
                      placeholder="070-123 45 67"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-none mb-4 border border-gray-300">
                  <h5 className="font-medium mb-2">Sammanfattning</h5>
                  {ticketCount > 0 && <p>Ordinarie biljetter: {ticketCount} × 175kr = {ticketCount * 175}kr</p>}
                  {discountTickets > 0 && <p>Rabatterade biljetter: {discountTickets} × 145kr = {discountTickets * 145}kr</p>}
                  <p className="font-bold">Totalt: {(ticketCount * 175) + (discountTickets * 145)}kr</p>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => setShowPurchaseForm(false)}
                    variant="outline"
                    className="rounded-none"
                  >
                    Tillbaka
                  </Button>
                  <Button 
                    onClick={handleCompletePurchase}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                    disabled={!purchaseData.name || !purchaseData.email || !purchaseData.phone}
                  >
                    Betala med Stripe →
                  </Button>
                </div>
              </div>
            )}
            
            {show.performers && show.performers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-gray-800 font-bold mb-3">Medverkande</h4>
                <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
                  <div className="space-y-6">
                    {show.performers.map((performer: any) => (
                      <div key={performer.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                        <img 
                          src={performer.image} 
                          alt={performer.name}
                          className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-gray-800 mb-2">
                            {performer.name}
                          </h5>
                          <p className="text-gray-700 leading-relaxed text-sm break-words" style={{ lineHeight: '1.3' }}>
                            {performer.bio}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Other shows section */}
          {otherShows.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-theatre-light mb-6">Fler föreställningar</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {otherShows.map((otherShow) => (
                  <Link key={otherShow.id} to={`/shows/${otherShow.slug}`} className="block">
                    <div className="border-4 border-white bg-white rounded-none p-4 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex flex-col">
                        <div className="flex-1 mb-3">
                          <h4 className="text-blue-500 font-bold text-base mb-1">
                            <span className="block md:hidden">{otherShow.title}</span>
                            <span className="hidden md:block">{otherShow.title}</span>
                          </h4>
                          <div className="block md:hidden text-blue-500 font-bold text-base mb-2">
                            {otherShow.date}
                          </div>
                          <div className="hidden md:block text-blue-500 font-bold text-base mb-2">
                            {otherShow.date}
                          </div>
                          <div className="flex items-center mb-2">
                            <MapPin size={14} className="text-gray-600 mr-1" />
                            <p className="text-gray-600 text-sm">{otherShow.location}</p>
                          </div>
                          <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
                            <span className="text-sm">Läs mer →</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <img 
                            src={otherShow.image} 
                            alt={otherShow.title}
                            className="w-full h-32 rounded-none object-cover object-top"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShowDetails;
