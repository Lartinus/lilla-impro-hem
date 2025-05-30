import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrivateInquiryForm from '@/components/PrivateInquiryForm';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

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
        </div>
      </section>

      {/* Main Content */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in flex-1">
        <div className="mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          <div className="border-4 border-white shadow-lg bg-white rounded-none p-6 md:p-8">
            
            {/* Main heading */}
            <div className="mb-8">
              <h3 className="text-theatre-secondary font-medium mb-6">
                Boka en improworkshop eller en skräddarsydd show till din fest, möhippa, svensexa, födelsedag eller annan tillställning.
              </h3>
              <p className="text-black text-base leading-relaxed">
                Improv Comedy är en perfekt aktivitet för att skapa skratt, gemenskap och minnen. Vi tar med oss det vi älskar med improv comedy – värme, överraskning och lekfullhet – och skapar något som passar just er.
              </p>
            </div>

            {/* What can you book */}
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

            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Hör av dig</h2>
              <PrivateInquiryForm />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mohippa;
