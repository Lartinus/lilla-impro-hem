import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Lokal = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Image */}
      <div className="relative w-full h-[360px] overflow-hidden">
        <img
          src="/uploads/images/sommar_LIT_2024.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      <div className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
          <div className="bg-[#F3F3F3] rounded-t-lg">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Lokal-info */}
              <div className="space-y-4">
                <h1>Ett community med egen scen</h1>
                <p>Vår verksamhet är under uppbyggnad. Ambitionen är att skapa ett levande och generöst community där improvisatörer, publik och grupper får mötas. Här finns det rum för kurser, workshops, egna ensembler och gästande grupper och improvisatörer att spela.</p>
                <p>Att skaffe en egen lokal är en viktig del av detta.</p>
              </div>

              {/* Kontakt för lokal */}
              <div className="space-y-4">
                <h2>Har du nys om en lokal?</h2>
                <p>Hör av dig till <a href="mailto:kontakt@improteatern.se" className="text-theatre-primary hover:text-theatre-secondary transition-colors">kontakt@improteatern.se</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Lokal;