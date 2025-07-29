
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformersSection from '@/components/PerformersSection';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const performers = [{
  id: 1,
  name: "Hjalmar Hardestam",
  bio: "Hjalmar har arbetat med Improv Comedy sedan 2020. Han är bland annat utbildad vid iO och The Annoyance i Chicago, The Free Association i London och har spelat på flera internationella festivaler. Han driver Göteborg Improv Comedy Club, podcasten Impropodden samt är producent för Dramaverket.",
  image: "/uploads/images/Hjalmar_Hardestam_2024.jpg"
}, {
  id: 2,
  name: "Ellen Bobeck",
  bio: "Ellen har arbetat med Improv Comedy sedan 2018. Hon är bland annat utbildad vid The Free Association i London, har spelat på internationella festivaler och undervisar på teatrar och skolor i Stockholm. Hon spelar med Spinoff och Britta, och är konstnärlig ledare för musikalensemblen Floden STHLM.",
  image: "/uploads/images/Ellen_Bobeck_2024.jpg"
}, {
  id: 3,
  name: "David Rosenqvist",
  bio: "David har spelat impro sedan 2013 och varit aktiv i Karlstad, Örebro och Stockholm. Han var med och grundade Dramaverket och Spinoff, och spelar nu på flera teatrar runt om i Stockholm. Till vardags arbetar han som producent inom event och teater – med känsla för struktur och kreativt genomförande.",
  image: "/uploads/images/David_Rosenqvist_2024.jpg"
}];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/sommar_LIT_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Om oss-info */}
          <div className="space-y-4 bg-white">
            <h2>Om Lilla Improteatern</h2>
            <p>Lilla Improteatern drivs av tre personer med en gemensam kärlek till Improv Comedy – och en stark vilja att skapa en plats där både skratten, hantverket och gemenskapen får stå i centrum. Vi kommer från olika håll men möttes i impron och i viljan att bygga något nytt tillsammans.</p>
          </div>

          {/* Kontaktuppgifter */}
          <div className="space-y-4 bg-white">
            <h3>Mejla oss på</h3>
            <p><a href="mailto:kontakt@improteatern.se" className="text-theatre-primary hover:text-theatre-secondary transition-colors">kontakt@improteatern.se</a></p>
          </div>

          {/* Personerna bakom */}
          <PerformersSection performers={performers} title="Produktionsteam" />
        </div>
      </section>
      
      <Footer />
    </div>;
};

export default About;
