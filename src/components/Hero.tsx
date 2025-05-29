
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Laugh, Lightbulb } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hem" className="bg-gradient-to-br from-theatre-cream to-theatre-warm-gray py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold text-theatre-charcoal leading-tight">
              Ditt nya hem för
              <span className="text-theatre-burgundy block">Improv Comedy</span>
              <span className="text-lg font-normal text-theatre-charcoal/70 block mt-2">
                i Stockholm
              </span>
            </h1>
            
            <p className="text-xl text-theatre-charcoal/80 leading-relaxed max-w-2xl">
              Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy. 
              Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-theatre-burgundy hover:bg-theatre-burgundy-dark text-white px-8 py-4 text-lg group"
              >
                Utforska våra kurser
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-theatre-burgundy text-theatre-burgundy hover:bg-theatre-burgundy hover:text-white px-8 py-4 text-lg"
              >
                Se kommande föreställningar
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 animate-float">
                <Users className="h-6 w-6 text-theatre-burgundy" />
                <span className="text-theatre-charcoal font-medium">Community</span>
              </div>
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '1s' }}>
                <Laugh className="h-6 w-6 text-theatre-burgundy" />
                <span className="text-theatre-charcoal font-medium">Komik</span>
              </div>
              <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '2s' }}>
                <Lightbulb className="h-6 w-6 text-theatre-burgundy" />
                <span className="text-theatre-charcoal font-medium">Kreativitet</span>
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="w-96 h-96 bg-theatre-burgundy/10 rounded-full absolute top-8 right-8 animate-float"></div>
            <div className="w-72 h-72 bg-theatre-gold/20 rounded-full absolute top-16 right-16 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="w-48 h-48 bg-theatre-burgundy/20 rounded-full absolute top-24 right-24 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <div className="text-4xl font-bold text-theatre-burgundy mb-2">🎭</div>
              <h3 className="text-xl font-semibold text-theatre-charcoal mb-4">
                Skapa tillsammans
              </h3>
              <p className="text-theatre-charcoal/70">
                I trygga, tydliga och inspirerande kursmiljöer utvecklas du som improvisatör tillsammans med andra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
