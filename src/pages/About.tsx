import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformersSection from '@/components/PerformersSection';

const performers = [
  {
    id: 1,
    name: "Emma Olofsson",
    bio: "Improvisatör, pedagog och kreativ ledare med fokus på värme och inkludering. Har arbetat med impro i över 10 år.",
    image: "/lovable-uploads/192352b9-7e67-447a-aa36-9b17372a4155.png",
  },
  {
    id: 2,
    name: "Jonas Åkesson",
    bio: "Flerfaldigt prisbelönt inom svensk improvisation och rutinerad kursledare. Alltid med glimten i ögat.",
    image: "/lovable-uploads/4ab70355-63ab-4d68-bfd3-3a2659550888.png",
  },
  {
    id: 3,
    name: "Fatima El Hajj",
    bio: "Lyfter alltid gruppen och hittar nya vinklar i varje scen. Älskad av elever för sitt pedagogiska lugn.",
    image: "/lovable-uploads/1287edaf-8412-4d2b-b6e4-b6fb8426185d.png",
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

      {/* Innehåll */}
      <section className="py-8 px-0.5 md:px-4 mt-20 flex-1">
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Om oss-info */}
          <div className="space-y-6 text-gray-700 leading-relaxed text-base" style={{ lineHeight: '1.3' }}>
            <h2 className="text-2xl text-theatre-secondary font-bold mb-5">Om Lilla Improteatern</h2>
            <p>
              Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy. Vi bygger med kvalitet, värme och ett stort fokus på att göra improvisatörerna bättre och publiken gladare.
            </p>
            <p>
              Vi tror att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. Här får du utvecklas som improvisatör i trygga miljöer och ta del av roliga, smarta och lekfulla föreställningar.
            </p>
            <p>
              Våra ledare och medlemmar brinner för improvisationsteater och vill skapa en kultur där du som elev, improvisatör och publik blir en del av något större.
            </p>
          </div>

          {/* Personerna bakom */}
          <PerformersSection performers={performers} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
