
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-32 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-12 text-white">
          Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy. Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans.
        </h1>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/kurser">
            <Button 
              size="lg" 
              className="bg-white text-theatre-burgundy hover:bg-white/90 px-12 py-6 text-xl font-medium group"
            >
              Utforska våra kurser
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-theatre-burgundy px-12 py-6 text-xl font-medium"
          >
            Se kommande föreställningar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
