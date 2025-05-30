
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import { useEffect } from 'react';

const Corporate = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi animate-fade-in">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Företag
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-0.5 md:px-4">
        <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none mx-3 md:mx-0 md:max-w-4xl md:mx-auto">
          
          {/* Main content */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Workshops och events för organisationer</h2>
            <h3 className="text-theatre-secondary font-medium mb-4">
              Utveckla kreativitet, samarbete och kommunikation genom improvisationsteater.
            </h3>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-base" style={{ lineHeight: '1.4' }}>
                Vi erbjuder skräddarsydda workshops och events för företag, myndigheter och organisationer som vill stärka 
                sina team genom kreativitet och lek. Våra workshops bygger på samma principer som vi använder i våra kurser 
                – men anpassade för din organisations specifika behov och mål.
              </p>
              <p className="text-base" style={{ lineHeight: '1.4' }}>
                Improvisationsteater är ett kraftfullt verktyg för att utveckla kommunikation, problemlösning och samarbete. 
                Genom övningar som bygger på spontanitet och lyhördhet hjälper vi era medarbetare att bli bekvämare med 
                osäkerhet, starkare i sitt uttryck och bättre på att lyssna på varandra.
              </p>
            </div>
          </div>

          {/* What we offer */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vad vi erbjuder</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Teambuilding-workshops</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ lineHeight: '1.4' }}>
                  Stärk sammanhållningen i gruppen genom roliga och utmanande improvisationsövningar som bygger förtroende och samarbete.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Kommunikationsträning</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ lineHeight: '1.4' }}>
                  Utveckla förmågan att lyssna aktivt, uttrycka sig tydligt och hantera svåra samtal med hjälp av improvisationstekniker.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Kreativitetsworkshops</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ lineHeight: '1.4' }}>
                  Lås upp kreativiteten och lär er att tänka utanför boxen genom övningar som tränar spontanitet och nytänkande.
                </p>
              </div>
              <div>
                <h3 className="text-theatre-secondary font-medium mb-2">Underhållning för events</h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ lineHeight: '1.4' }}>
                  Skräddarsy en improvisationsföreställning för er kick-off, personalfest eller konferens – interaktivt och skrattfyllt.
                </p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gör en förfrågan</h2>
            <p className="text-gray-700 mb-6 text-base" style={{ lineHeight: '1.4' }}>
              Berätta om era behov så skräddarsyr vi ett förslag som passar er organisation och era mål.
            </p>
            <CorporateInquiryForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Corporate;
