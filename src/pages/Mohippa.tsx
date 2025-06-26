
// Hårdkodad version av Möhippa-sidan (utan API-anrop)
import Header from '@/components/Header';
import PrivateInquiryForm from '@/components/PrivateInquiryForm';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const Mohippa = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className="min-h-screen flex flex-col bg-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      <SimpleParallaxHero imageSrc="/lovable-uploads/1287edaf-8412-4d2b-b6e4-b6fb8426185d.png" />
      <section className="py-8 px-0.5 md:px-4 flex-1 relative z-10" style={{
      paddingTop: "220px"
    }}>
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Huvudinnehåll */}
          <div>
            {/* Rubrik */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-2">Impro för möhippa, svensexa eller festen.</h2>
              <p className="text-black text-base leading-relaxed">
                Improv Comedy är en perfekt aktivitet för att skapa skratt, gemenskap och minnen. Vi tar med oss det vi älskar med improv comedy – värme, överraskning och lekfullhet – och skapar något som passar just er.
              </p>
            </div>

            {/* Vad kan ni boka */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Vad kan ni boka?</h2>
              <ul className="space-y-3 text-black">
                <li className="flex items-start">
                  <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <strong>Improshow</strong> – En specialutformad improföreställning där vi inkluderar detaljer om t.ex. födelsedagsbarnet eller brudparet
                  </div>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <strong>Workshop</strong> – En lekfull och inkluderande introduktion i Improv Comedy, inga förkunskaper krävs
                  </div>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="text-red-800 mr-2 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <strong>Workshop + Show</strong> – Börja med en workshop tillsammans, avsluta med att vi uppträder för er
                  </div>
                </li>
              </ul>
            </div>

            {/* Plats */}
            <div className="mb-8">
              <p className="text-black text-base leading-relaxed">
                Vi kommer gärna till er – eller hjälper till att ordna plats i samarbete med lokaler i Stockholm.
              </p>
            </div>

            {/* Exempel */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Exempel på tillfällen vi passar för:</h2>
              <ul className="space-y-2 text-black">
                <li className="flex items-center">
                  <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                  Möhippor & svensexor
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                  Födelsedagsfester
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                  After work
                </li>
                <li className="flex items-center">
                  <ArrowRight className="text-red-800 mr-2 flex-shrink-0" size={16} />
                  Kompisgäng som vill göra något kul tillsammans
                </li>
              </ul>
            </div>
          </div>

          {/* Kontaktformulär */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4">Hör av dig</h2>
            <PrivateInquiryForm />
          </div>
        </div>
      </section>
    </div>;
};

export default Mohippa;
