import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CorporateInquiryForm from '@/components/CorporateInquiryForm';
import PrivateInquiryForm from '@/components/PrivateInquiryForm';

export default function AnlitaOss() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      
      {/* Hero Image */}
      <div className="h-[360px] relative overflow-hidden">
        <img 
          src="/uploads/images/shows_2024.jpg" 
          alt="" 
          className="w-full h-full object-cover object-center filter brightness-50"
        />
      </div>
      
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[1000px] -mt-16">
          <div className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Hero section */}
              <section>
                <h1>Roligare än quiz. Mer minnesvärt än mingel.</h1>
                <p>
                  Lilla Improteatern erbjuder improviserad underhållning och workshops för både privata 
                  tillställningar och företag. Oavsett om det handlar om en födelsedag, möhippa, kick-off 
                  eller konferens skapar vi upplevelser i stunden – med hög grad av igenkänningshumor, 
                  överraskningar och gemenskap i fokus.
                </p>
              </section>

              {/* Two column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Corporate section */}
                <section className="space-y-4 pt-6 border-t border-gray-200">
                  <h2>Workshops & Events för er organisation</h2>
                  <p className="font-bold">
                    Vill ni ha skratt, samarbete och kunskap i samma paket?
                  </p>
                  <p>
                    Lilla Improteatern erbjuder skräddarsydda workshops och föreställningar för företag, 
                    organisationer och myndigheter. Vi använder verktyg från Improv Comedy för att träna 
                    kommunikation, lyssnande, kreativitet och samspel – på ett sätt som är både roligt 
                    och effektfullt.
                  </p>

                  <div className="space-y-4">
                    <p className="font-bold">Vi erbjuder bland annat:</p>
                    <ul className="space-y-2">
                      {[
                        ["Teambuilding-workshops", "Stärk samspel och gruppdynamik"],
                        ["Scenarioträning", "Vi gestaltar utmaningar, ni utforskar lösningarna."],
                        ["Föreställning på er konferens eller kickoff", "Smart humor och stor igenkänning"]
                      ].map(([title, description], i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          <div>
                            <span className="font-medium">{title}</span>
                            <span className="text-gray-600"> – {description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    Vi har erfarenhet av att jobba med såväl stora företag som små arbetsgrupper och 
                    anpassar alltid upplägget efter era behov och förutsättningar.
                  </p>

                  <div className="space-y-4">
                    <p className="font-bold">Exempel på tillfällen vi passar extra bra för:</p>
                    <ul className="space-y-2">
                      {[
                        "APT och personaldagar",
                        "Konferenser och temadagar",
                        "Kickoff och After Work",
                        "Företagsfester, t.ex. jul- och sommarfest",
                        "Samarbetsträffar & nätverksdagar"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="mb-4 font-bold">Berätta om er organisation och vad ni är ute efter:</p>
                    <CorporateInquiryForm />
                  </div>
                </section>

                {/* Private section */}
                <section className="space-y-4 pt-6 border-t border-gray-200">
                  <h2>Underhållning & upplevelse till ert firande</h2>
                  <p className="font-bold">
                    Ordnar du en privat tillställning och vill ge någon en upplevelse de aldrig glömmer?
                  </p>
                  <p>
                    Boka en improworkshop eller en skräddarsydd show till din fest, möhippa, svensexa, 
                    födelsedag eller annan tillställning. Improv Comedy är en perfekt aktivitet för att 
                    skapa skratt, gemenskap och minnen. Vi tar med oss det vi älskar med Improv Comedy – 
                    värme, överraskning och lekfullhet – och skapar något som passar just er.
                  </p>

                  <div className="space-y-4">
                    <p className="font-bold">Vad ni kan boka:</p>
                    <ul className="space-y-3">
                      {[
                        ["Impropass", "En skrattig, spontan och oförglömlig aktivitet – inga förkunskaper krävs."],
                        ["Föreställning", "En improviserad show skräddarsydd för just ert firande – där vi väver in detaljer om huvudpersonen. Roligt, personligt och helt unikt."],
                        ["Impropass + Föreställning", "Börja med att skratta och skapa tillsammans – avsluta med att luta er tillbaka och njuta av en föreställning vi skapar bara för er."]
                      ].map(([title, description], i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          <div>
                            <span className="font-medium">{title}</span>
                            <span className="text-gray-600"> – {description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    Vi kommer gärna till er – eller hjälper till att ordna plats i samarbete med 
                    lokaler i Stockholm.
                  </p>

                  <div className="space-y-4">
                    <p className="font-bold">Exempel på tillfällen vi passar bra för:</p>
                    <ul className="space-y-2">
                      {[
                        "Möhippor & svensexor",
                        "Födelsedagsfester",
                        "Kompisgäng som vill göra något kul tillsammans"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="mb-4 font-bold">Vill du veta mer eller boka oss?</p>
                    <PrivateInquiryForm />
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}