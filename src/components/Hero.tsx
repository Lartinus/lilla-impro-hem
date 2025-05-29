
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-left space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
            Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
          </h1>

          <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light">
            Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
          </p>

          <div className="space-y-6">
            <p className="text-lg text-white font-medium">Här hittar du:</p>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-base text-white/90">• Kurser i Improv Comedy – från nybörjare till ensemble.</p>
                <Link to="/kurser">
                  <Button 
                    size="sm" 
                    className="bg-white text-theatre-burgundy hover:bg-white/90 px-6 py-2 text-sm font-medium"
                  >
                    Utforska våra kurser
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                <p className="text-base text-white/90">• Föreställningar i hög variation med fokus på komik</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-theatre-burgundy px-6 py-2 text-sm font-medium"
                >
                  Se kommande föreställningar
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-base text-white/90">• Workshops och events för företag, myndigheter och organisationer</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-theatre-burgundy px-6 py-2 text-sm font-medium"
                >
                  Läs mer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
