import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Corporate = () => {
  const handleContact = () => {
    // Navigate to contact section or form
    console.log('Contact button clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex flex-col">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      <div className="flex-grow">
        {/* Hero */}
        <section className="px-0.5 md:px-4 mt-20 py-6">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
              Workshops, teambuilding & underhållning
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-0.5 md:px-4 pb-8">
          <div className="space-y-8 border-4 border-white p-8 md:p-6 lg:p-12 bg-white rounded-none mx-6 md:mx-0 md:max-w-5xl md:mx-auto">
            <div className="text-left">
              <h3 className="text-theatre-secondary font-medium mb-6">
                Vill ni ha skratt, samarbete och kunskap i samma paket? Då är ni välkomna till oss.
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-8 text-sm md:text-base">
                Lilla Improteatern erbjuder skräddarsydda workshops och föreställningar för företag, organisationer och myndigheter. Vi använder verktyg från Improv Comedy för att utveckla kommunikation, lyssnande, kreativitet och samarbete – på ett sätt som både är roligt och ger långvariga effekter.
              </p>
              
              <h4 className="text-black font-bold mb-6">
                Vi erbjuder bland annat:
              </h4>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-sm font-bold">→</span>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Teambuilding-workshops</span> – stärk samspel och gruppdynamik
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-sm font-bold">→</span>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Kreativitetsboosters</span> – lås upp nya sätt att tänka tillsammans
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-sm font-bold">→</span>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Kommunikation</span> – öva på att lyssna, leda och följa
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-sm font-bold">→</span>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">Improföreställningar på er konferens eller kickoff</span> – smart humor och stor igenkänning
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-8 text-sm md:text-base">
                Vi har erfarenhet av att jobba med såväl stora företag som små arbetsgrupper, och vi anpassar alltid upplägget efter era behov, mål och förutsättningar.
              </p>
              
              <Button 
                onClick={handleContact}
                className="px-8 py-3 text-sm font-medium"
              >
                Gör en förfrågan
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Corporate;
