
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const performers = [
  {
    id: 1,
    name: "Hjalmar Hardestam",
    bio: `Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramakverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler — bland annat i Amsterdam, Edinburgh och Nottingham — och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London.`,
    image: "/lovable-uploads/7e10e177-5707-44b1-bbf3-e5f9507d3054.png"
  },
  {
    id: 2,
    name: "Ellen Bobeck",
    bio: `Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med teon Britta, och är konstnärlig ledare för musikensemblen Floden STHLM — där hon kombinerar musikalisk känsla med improviserat berättande.`,
    image: "/lovable-uploads/8137df73-dcb4-4e44-9fb8-b0d0317e9bc4.png",
  },
  {
    id: 3,
    name: "David Rosenqvist",
    bio: `David började med improvisationsteater 2013 och har sedan dess varit en aktiv del av improscenerna i Karlstad, Örebro och Stockholm. Han var med och startade Dramakverket 2014 och senare Spinoff 2021. I dag spelar han både med Spinoff, Dramakverket och Floden STHLM. Han gästar 2025 även Stockholm Improvisationsteater och Push Play Theatre. Till vardags jobbar David som producent inom event och teater – med ett öga för struktur, sammanhang och att få saker att hända.`,
    image: "/lovable-uploads/c4cb950f-fa49-4fc8-ad5e-96402ad423f2.png"
  }
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      <section className="py-8 px-0.5 md:px-4 mt-20 flex-1">
        {/* Röd ram kring allt innehåll */}
        <div className="space-y-10 border-4 border-[#802735] p-6 md:p-8 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          {/* Titel och introduktion */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Vi vill skapa ett hem för Improv Comedy i Stockholm<br />
              <span className="font-normal text-lg md:text-xl text-gray-900">
                där alla kan växa, lära och skratta tillsammans.
              </span>
            </h2>
            <p className="text-black text-base md:text-lg mt-4 mb-3">
              Lilla Improteatern grundades med en enkel idé: att Improv Comedy ska vara tillgängligt för alla som vill lära sig, oavsett bakgrund eller tidigare erfarenhet. Vi tror på att humor är något som går att träna och att de bästa komiska scenerna skapas när vi arbetar tillsammans.
            </p>
            <p className="text-black text-base md:text-lg mb-0">
              Genom våra kurser, föreställningar och workshops bygger vi en community där kreativitet, generositet och glädje står i centrum. Vi tar improvisationsteater på allvar — både som konstform och som verktyg för personlig utveckling.
            </p>
          </div>
          {/* Medverkande */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Medverkande</h3>
            <div className="space-y-8">
              {performers.map(performer => (
                <div key={performer.id} className="flex flex-col md:flex-row md:space-x-5 items-start border border-[#802735] p-3 md:p-4 rounded-lg bg-white">
                  <img
                    src={performer.image}
                    alt={performer.name}
                    className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-md mb-3 md:mb-0 flex-shrink-0 border border-gray-300"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{performer.name}</h4>
                    <p className="text-black text-base">{performer.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
