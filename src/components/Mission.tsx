
import { Heart, Star, Users2 } from 'lucide-react';

const Mission = () => {
  return (
    <section className="py-20 bg-theatre-warm-gray">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-theatre-charcoal mb-8">
            Vår mission
          </h2>
          
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-12">
            <p className="text-xl text-theatre-charcoal/80 leading-relaxed mb-8">
              Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare – och på att skapa ett community 
              där du som elev, improvisatör och publik blir en del av något större.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-theatre-burgundy/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-theatre-burgundy" />
                </div>
                <h3 className="text-lg font-semibold text-theatre-charcoal mb-2">
                  Kvalitet
                </h3>
                <p className="text-theatre-charcoal/70">
                  Vi prioriterar kvalitet framför kvantitet i allt vi gör
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-theatre-burgundy/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-theatre-burgundy" />
                </div>
                <h3 className="text-lg font-semibold text-theatre-charcoal mb-2">
                  Nyfikenhet
                </h3>
                <p className="text-theatre-charcoal/70">
                  Vi utforskar konstformen med öppna sinnen och lekfull anda
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-theatre-burgundy/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users2 className="h-8 w-8 text-theatre-burgundy" />
                </div>
                <h3 className="text-lg font-semibold text-theatre-charcoal mb-2">
                  Community
                </h3>
                <p className="text-theatre-charcoal/70">
                  Vi skapar en gemenskap där alla känner sig välkomna
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-theatre-burgundy text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-6">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm
            </h3>
            <p className="text-xl opacity-90 leading-relaxed">
              På vår teater får du utvecklas som improvisatör i trygga, tydliga och 
              inspirerande kursmiljöer, och samtidigt ta del av roliga, smarta och 
              lekfulla föreställningar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
