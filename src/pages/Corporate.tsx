
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
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="py-12 px-6 mt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-8">
            Workshops, teambuilding & underhållning
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-12 border-4 border-white p-16 bg-white rounded-none">
            <div className="text-left">
              <h3 className="text-theatre-secondary font-medium mb-6">
                Vill ni ha skratt, samarbete och kunskap i samma paket? Då är ni välkomna till oss.
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-8">
                Lilla Improteatern erbjuder skräddarsydda workshops och föreställningar för företag, organisationer och myndigheter. Vi använder verktyg från Improv Comedy för att utveckla kommunikation, lyssnande, kreativitet och samarbete – på ett sätt som både är roligt och ger långvariga effekter.
              </p>
              
              <h4 className="text-black font-bold mb-6">
                Vi erbjuder bland annat:
              </h4>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Teambuilding-workshops</span> – stärk samspel och gruppdynamik
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Kreativitetsboosters</span> – lås upp nya sätt att tänka tillsammans
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Kommunikation</span> – öva på att lyssna, leda och följa
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Improföreställningar på er konferens eller kickoff</span> – smart humor och stor igenkänning
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-8">
                Vi har erfarenhet av att jobba med såväl stora företag som små arbetsgrupper, och vi anpassar alltid upplägget efter era behov, mål och förutsättningar.
              </p>
              
              <Button 
                onClick={handleContact}
                className="bg-theatre-primary hover:bg-theatre-primary/90 text-white px-8 py-3 text-lg"
              >
                Gör en förfrågan
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Corporate;
