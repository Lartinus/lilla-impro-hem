
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Om oss
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-0.5 md:px-4 animate-fade-in">
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Mission */}
          <div className="text-left">
            <h3 className="text-theatre-secondary font-medium mb-4">
              Vi vill skapa ett hem för Improv Comedy i Stockholm där alla kan växa, lära och skratta tillsammans.
            </h3>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-base" style={{ lineHeight: '1.3' }}>
                Lilla Improteatern grundades med en enkel idé: att Improv Comedy ska vara tillgängligt för alla som vill lära sig, 
                oavsett bakgrund eller tidigare erfarenhet. Vi tror på att humor är något som går att träna och att de bästa 
                komiska scenerna skapas när vi arbetar tillsammans.
              </p>
              <p className="text-base" style={{ lineHeight: '1.3' }}>
                Genom våra kurser, föreställningar och workshops bygger vi en community där kreativitet, generositet och 
                glädje står i centrum. Vi tar improvisationsteater på allvar – både som konstform och som verktyg för 
                personlig utveckling.
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Vårt team</h2>
            <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-6">
              <div className="space-y-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-gray-800 mb-3 text-lg">
                        {member.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm break-words" style={{ lineHeight: '1.3' }}>
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kom i kontakt med oss</h2>
            <p className="text-gray-700 mb-6 text-base" style={{ lineHeight: '1.3' }}>
              Har du frågor om våra kurser eller vill bara säga hej? Vi hör gärna från dig!
            </p>
            <div className="space-y-2 text-gray-700">
              <p className="text-base">info@lillaimproteatern.se</p>
              <p className="text-base">+46 70 245 04 74</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
