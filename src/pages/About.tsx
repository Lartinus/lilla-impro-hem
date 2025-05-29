import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const About = () => {
  const productionTeam = [
    {
      id: 1,
      name: "David Rosenqvist",
      image: "/lovable-uploads/5cb42dd8-59bc-49e4-ae83-9bb0da74f658.png",
      bio: "David började med improvisationsteater 2013 och har sedan dess varit en aktiv del av improscenerna i Karlstad, Örebro och Stockholm. Han var med och startade Dramaverket 2014 och senare Spinoff 2021. I dag spelar han både med Dramaverket och Floden STHLM, och gästar under våren 2025 även Stockholm Improvisationsteater. Till vardags jobbar David som producent inom event och teater – med ett öga för struktur, sammanhang och att få saker att hända."
    },
    {
      id: 2,
      name: "Ellen Bobeck",
      image: "/lovable-uploads/df0cb53d-072e-4970-b9fa-e175209d1cf7.png",
      bio: "Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med trion Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM – där hon kombinerar musikalisk känsla med improviserat berättande."
    },
    {
      id: 3,
      name: "Hjalmar Hardestam",
      image: "/lovable-uploads/192352b9-7e67-447a-aa36-9b17372a4155.png",
      bio: "Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramaverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler – bland annat i Amsterdam, Edinburgh och Nottingham – och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London."
    }
  ];

  const handleContact = () => {
    window.location.href = 'mailto:info@lillaimproteatern.se';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex flex-col">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      <div className="flex-grow">
        {/* Hero */}
        <section className="px-6 mt-20 py-12">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
              Om oss
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6 pb-12">
          <div className="space-y-12 border-4 border-white p-8 md:p-16 bg-white rounded-none mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            <div className="text-left">
              <p className="text-gray-700 leading-relaxed mb-8 text-sm md:text-base">
                Lilla Improteatern drivs av tre personer med en gemensam kärlek till Improv Comedy – och en stark vilja att skapa en plats där både skratten, hantverket och gemenskapen får stå i centrum. Vi kommer från olika håll men möttes i impron – och i viljan att bygga något nytt tillsammans.
              </p>
              
              <h2 className="text-xl font-bold text-gray-800 mb-8">Produktionsteam</h2>
              
              <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4 mb-8">
                <div className="space-y-8">
                  {productionTeam.map((member) => (
                    <div key={member.id} className="flex items-start space-x-4">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 mb-2">
                          {member.name}
                        </h5>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-sm text-left">
                          {member.bio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-8 text-sm md:text-base">
                Tillsammans vill vi skapa en plats där människor inte bara lär sig impro, utan blir en del av ett sammanhang. Lilla Improteatern ska vara ett hem för alla som vill utvecklas, spela, skratta – och växa tillsammans.
              </p>
              
              <Button 
                onClick={handleContact}
                className="px-8 py-3 text-base font-medium"
              >
                Kontakt
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
