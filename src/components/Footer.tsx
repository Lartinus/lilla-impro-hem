
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theatre-tertiary text-theatre-light py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-theatre-light">
              Lilla Improteatern
            </h3>
            <p className="text-theatre-light/80 leading-relaxed">
              Ditt nya hem för Improv Comedy i Stockholm. Vi skapar tillsammans genom humor, kreativitet och gemenskap.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-theatre-light/60 hover:text-theatre-light transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-theatre-light/60 hover:text-theatre-light transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-light">
              Kontakt
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-theatre-light/70" />
                <span className="text-theatre-light/80">Stockholm, Sverige</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-theatre-light/70" />
                <span className="text-theatre-light/80">+46 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-theatre-light/70" />
                <span className="text-theatre-light/80">info@lillaimproteatern.se</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-light">
              Öppettider
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-theatre-light/70 mt-1" />
                <div className="text-theatre-light/80">
                  <div>Mån-Fre: 18:00-22:00</div>
                  <div>Lör-Sön: 14:00-20:00</div>
                  <div className="text-sm mt-1 text-theatre-light/60">
                    (Eller enligt föreställningsschema)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-light">
              Snabblänkar
            </h4>
            <div className="space-y-2">
              <a href="#kurser" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Kurser
              </a>
              <a href="#forestallningar" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Föreställningar
              </a>
              <a href="#foretag" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Företagsworkshops
              </a>
              <a href="#kontakt" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Kontakt
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-theatre-light/20 mt-12 pt-8 text-center">
          <p className="text-theatre-light/60">
            © 2024 Lilla Improteatern. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
