
import { useEffect } from 'react';
import Header from '@/components/Header';
import PerformersSection from '@/components/PerformersSection';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const performers = [{
  id: 1,
  name: "Hjalmar Hardestam",
  bio: "Hjalmar har undervisat på flera improvisationsscener runtom i Sverige. Han är baserad i Stockholm men har tidigare undervisat på Improverket och Gbgimpro i Göteborg och på Dramaverket i Karlstad. Han driver även Göteborg Improv Comedy Club samt podcasten Impropodden. Hjalmar har spelat på flera europeiska festivaler – bland annat i Amsterdam, Edinburgh och Nottingham – och är utbildad vid Improv Olympic och The Annoyance i Chicago samt The Free Association i London.",
  image: "/lovable-uploads/e9bbaf53-f37e-4d94-898b-b113f45c448c.png"
}, {
  id: 2,
  name: "Ellen Bobeck",
  bio: "Ellen har arbetat med improvisationsteater sedan 2018, både som skådespelare och pedagog. Hon undervisar på flera olika skolor och teatrar i Stockholm, och har stått på scen på festivaler i bland annat Berlin, Oslo, Dublin och Edinburgh. Förutom Spinoff spelar hon även med trion Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM – där hon kombinerar musikalisk känsla med improviserat berättande.",
  image: "/lovable-uploads/fadc0cc9-7461-4cdb-9957-078caca49b1b.png"
}, {
  id: 3,
  name: "David Rosenqvist",
  bio: "David började med improvisationsteater 2013 och har sedan dess varit en aktiv del av improscenerna i Karlstad, Örebro och Stockholm. Han var med och startade Dramaverket 2014 och senare Spinoff 2021. I dag spelar han både med Dramaverket och Floden STHLM, och gästar under våren 2025 även Stockholm Improvisationsteater. Till vardags jobbar David som producent inom event och teater - med ett öga för struktur, sammanhang och att få saker att hända.",
  image: "/lovable-uploads/626ba92c-0c46-4de3-bedc-28806d7c7f68.png"
}];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      <SimpleParallaxHero imageSrc="/lovable-uploads/0dab5207-02ae-4f61-96e5-de85a5a8d3ad.png" />
      <section className="py-8 px-0.5 md:px-4 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Om oss-info */}
          <div className="space-y-6 text-gray-700 leading-relaxed text-base" style={{
          lineHeight: '1.3'
        }}>
            <h2 className="mb-2">Om Lilla Improteatern</h2>
            <p className="text-left">Lilla Improteatern drivs av tre personer med en gemensam kärlek till Improv Comedy – och en stark vilja att skapa en plats där både skratten, hantverket och gemenskapen får stå i centrum. Vi kommer från olika håll men möttes i impron – och i viljan att bygga något nytt tillsammans.</p>
          </div>

          {/* Personerna bakom */}
          <PerformersSection performers={performers} title="Produktionsteam" />
        </div>
      </section>
    </div>;
};

export default About;
