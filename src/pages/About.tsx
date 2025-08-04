
import { useEffect } from 'react';
import Header from '@/components/Header';
import PerformersSection from '@/components/PerformersSection';
import OptimizedImage from '@/components/OptimizedImage';


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

  return (
    <>
      <Header />
      
      {/* Hero Image */}
      <div className="h-[360px] relative overflow-hidden">
        <OptimizedImage 
          src="/uploads/images/sommar_LIT_2024.jpg" 
          alt="" 
          className="w-full h-full object-cover object-center"
          priority={true}
          sizes="100vw"
        />
      </div>
      
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
          <div className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
          
              {/* Om oss-info */}
              <div className="space-y-4">
                <h1>Om Lilla Improteatern</h1>
                <p>Lilla Improteatern drivs av tre personer med en gemensam kärlek till Improv Comedy. Vi vill skapa en plats där både hantverket och gemenskapen får stå i centrum. Vi kommer från olika håll men möttes i impron och i viljan att bygga något nytt tillsammans.</p>
              </div>

              {/* Personerna bakom */}
              <PerformersSection performers={performers} title="Produktionsteam" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
