import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const Lokal = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/sommar_LIT_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Lokal-info */}
          <div className="space-y-4 bg-white">
            <h2>Vi bygger en ny hemmascen för Improv Comedy i Stockholm</h2>
            <h3>Och du är inbjuden.</h3>
            <p>Vår verksamhet är under uppbyggnad. Ambitionen är att skapa ett levande och generöst community där improvisatörer, publik och grupper får mötas. Här finns det rum för kurser, workshops, egna ensembler och gästande grupper och improvisatörer att spela.</p>
            <p>Vi har ännu ingen fast lokal som är en viktig del i vår vision: att bygga ett improcommunity där både publik och improvisatörer känner sig hemma, inspirerade och välkomna.</p>
          </div>

          {/* Kontakt för lokal */}
          <div className="space-y-4 bg-white">
            <h2>Har du nys om en lokal?</h2>
            <p>Hör av dig till <a href="mailto:kontakt@improteatern.se" className="text-theatre-primary hover:text-theatre-secondary transition-colors">kontakt@improteatern.se</a></p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Lokal;