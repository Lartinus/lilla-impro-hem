
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Corporate = () => {
  const handleContact = () => {
    // Scroll to contact section in footer or open contact form
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-theatre-light">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-black mb-8">
              Workshops, teambuilding & underhållning
            </h1>
            
            <div className="space-y-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Vill ni ha skratt, samarbete och kunskap i samma paket? Då är ni välkomna till oss.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Lilla Improteatern erbjuder skräddarsydda workshops och föreställningar för företag, organisationer och myndigheter. Vi använder verktyg från Improv Comedy för att utveckla kommunikation, lyssnande, kreativitet och samarbete – på ett sätt som både är roligt och ger långvariga effekter.
              </p>
              
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  Vi erbjuder bland annat:
                </h2>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theatre-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Teambuilding-workshops</h3>
                      <p className="text-gray-600">stärk samspel och gruppdynamik</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theatre-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Kreativitetsboosters</h3>
                      <p className="text-gray-600">lås upp nya sätt att tänka tillsammans</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theatre-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Kommunikation</h3>
                      <p className="text-gray-600">öva på att lyssna, leda och följa</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theatre-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Improföreställningar på er konferens eller kickoff</h3>
                      <p className="text-gray-600">smart humor och stor igenkänning</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Vi har erfarenhet av att jobba med såväl stora företag som små arbetsgrupper, och vi anpassar alltid upplägget efter era behov, mål och förutsättningar.
              </p>
              
              <div className="pt-8">
                <Button 
                  onClick={handleContact}
                  className="bg-theatre-primary hover:bg-theatre-primary/90 text-white px-8 py-3 text-lg"
                >
                  Kontakt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Corporate;
