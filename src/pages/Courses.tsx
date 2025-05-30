
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useEffect } from 'react';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const courseLeaders = [
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
    }
  ];

  const courses = [
    {
      title: "Nybörjarkurs Improv Comedy",
      subtitle: "Lär dig grunderna i improvisationsteater",
      description: "En kurs för dig som aldrig har provat improvisationsteater tidigare eller bara gjort det lite grand. Under sex veckor lär vi dig grundläggande verktyg för att skapa scener tillsammans med andra.",
      courseLeader: courseLeaders[0],
      available: true,
      showButton: true
    },
    {
      title: "Påbyggnadskurs Improv Comedy",
      subtitle: "Utveckla dina färdigheter inom improvisationsteater",
      description: "För dig som har gått grundkurs eller har motsvarande erfarenhet. Vi fördjupar oss i mer avancerade tekniker och jobbar med längre scener och berättarstrukturer.",
      courseLeader: courseLeaders[1],
      available: true,
      showButton: true
    },
    {
      title: "Helgworkshops & Specialkurser",
      subtitle: "Intensiva kurser för alla nivåer",
      description: "Olika teman och tekniker som Character Creation, Storytelling, Musical Improv och Genre Work. Perfekt för både nybörjare och erfarna improvisatörer som vill utforska specifika områden.",
      courseLeader: null,
      available: false,
      showButton: false
    }
  ];

  const practicalInfo = [
    "6 tillfällen à 2 timmar",
    "Max 12 deltagare per kurs",
    "Pris: 1800 kr",
    "Plats: Stockholm (detaljer kommer)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Kurser
          </h1>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {courses.map((course, index) => (
            <CourseCard 
              key={index} 
              course={course}
              practicalInfo={practicalInfo}
            />
          ))}
        </div>
        
        {/* Vision Box */}
        <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
          <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
            <div className="text-left space-y-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4">
                Lär dig spela det som redan är kul
              </h1>
              <p className="text-base leading-relaxed text-gray-700 font-light" style={{ lineHeight: '1.3' }}>
                Istället för att kämpa för att hitta på något kul, lär vi dig hur man upptäcker det som redan är roligt – i dina impulser, i samspelet och i scenens logik. Vi tränar dig att hitta "Game of the Scene", att följa det roliga och att få det att växa.
              </p>
            </div>
          </div>
        </div>

        {/* Vision Box */}
        <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-6">
          <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
            <div className="text-left space-y-4">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4">
                Vår vision
              </h1>
              <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl text-left">
                Att skapa ett community där alla känner sig välkomna att utforska, lära och växa inom improvisationsteater.
              </h3>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-base" style={{ lineHeight: '1.3' }}>
                  Vi tror på att improvisationsteater är för alla, oavsett bakgrund eller tidigare erfarenhet. 
                  Våra kurser är designade för att vara inkluderande miljöer där du får utforska din kreativitet 
                  i en trygg och stöttande atmosfär.
                </p>
                
                <div className="space-y-4">
                  <h4 className="text-theatre-secondary font-medium mb-3">Du är varmt välkommen oavsett om du:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Aldrig har provat improvisationsteater tidigare</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Har gjort teater eller stand-up comedy tidigare</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Vill utveckla din kreativitet och spontanitet</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>Söker nya sätt att uttrycka dig och ha kul</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-base" style={{ lineHeight: '1.3' }}>
                  Vi fokuserar på att bygga förtroende, utveckla lyssnarförmåga och lära dig att 
                  säga "ja, och..." till dina egna och andras idéer. Genom strukturerade övningar 
                  och spel kommer du att utveckla verktyg som fungerar både på scen och i vardagslivet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-6">
          <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Vanliga frågor</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Behöver jag ha erfarenhet av teater för att gå en kurs?</h3>
                  <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                    Nej, våra nybörjarkurser är designade för personer utan tidigare erfarenhet. 
                    Vi börjar från grunden och bygger upp färdigheterna steg för steg.
                  </p>
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Är improvisationsteater samma sak som stand-up?</h3>
                  <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                    Nej, improvisationsteater handlar om att skapa scener och berättelser tillsammans med andra, 
                    medan stand-up är en soloform. Improv fokuserar mer på samarbete och berättande.
                  </p>
                </div>
                <div>
                  <h3 className="text-theatre-secondary font-medium mb-1">Vad händer om jag mår dåligt en kursdag?</h3>
                  <p className="text-gray-700 text-base" style={{ lineHeight: '1.3' }}>
                    Kontakta oss så snart som möjligt. Vi försöker alltid hitta lösningar, 
                    som att erbjuda en plats i nästa kursomgång för den missade lektionen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
