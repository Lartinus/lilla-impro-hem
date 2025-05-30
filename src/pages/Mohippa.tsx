
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import { useEffect } from 'react';

const Mohippa = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Möhippa
          </h1>
          <p className="text-theatre-light text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Vill du ge någon en upplevelse de sent kommer att glömma?
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-black text-base leading-relaxed mb-4">
                Boka en improworkshop eller en skräddarsydd show till din fest, möhippa, svensexa, födelsedag eller annan tillställning.
              </p>
              <p className="text-black text-base leading-relaxed">
                Improv Comedy är en perfekt aktivitet för att skapa skratt, gemenskap och minnen. Vi tar med oss det vi älskar med improv comedy – värme, överraskning och lekfullhet – och skapar något som passar just er.
              </p>
            </div>

            {/* What can you book */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Vad kan ni boka?</h2>
              <ul className="space-y-3 text-black">
                <li className="flex items-start">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  <div>
                    <strong>Improshow</strong> – En specialutformad improföreställning där vi inkluderar detaljer om t.ex. födelsedagsbarnet eller brudparet
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  <div>
                    <strong>Workshop</strong> – En lekfull och inkluderande introduktion i Improv Comedy, inga förkunskaper krävs
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  <div>
                    <strong>Workshop + Show</strong> – Börja med att en workshop tillsammans, avsluta med att vi uppträder för er
                  </div>
                </li>
              </ul>
            </div>

            {/* Location */}
            <div className="mb-8">
              <p className="text-black text-base leading-relaxed">
                Vi kommer gärna till er – eller hjälper till att ordna plats i samarbete med lokaler i Stockholm.
              </p>
            </div>

            {/* Examples */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Exempel på tillfällen vi passar för:</h2>
              <ul className="space-y-2 text-black">
                <li className="flex items-center">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  Möhippor & svensexor
                </li>
                <li className="flex items-center">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  Födelsedagsfester
                </li>
                <li className="flex items-center">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  After work
                </li>
                <li className="flex items-center">
                  <span className="text-red-800 font-bold mr-2">•</span>
                  Kompisgäng som vill göra något kul tillsammans
                </li>
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Hör av dig</h2>
              <CorporateInquiryForm />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mohippa;
