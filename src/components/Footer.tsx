
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theatre-dark-secondary text-theatre-text-primary py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-theatre-accent">
              Lilla Improteatern
            </h3>
            <p className="text-theatre-text-secondary leading-relaxed">
              Ditt nya hem för Improv Comedy i Stockholm. Vi skapar tillsammans genom humor, kreativitet och gemenskap.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-theatre-text-muted hover:text-theatre-accent transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-theatre-text-muted hover:text-theatre-accent transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-accent">
              Kontakt
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-theatre-accent" />
                <span className="text-theatre-text-secondary">Stockholm, Sverige</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-theatre-accent" />
                <span className="text-theatre-text-secondary">+46 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-theatre-accent" />
                <span className="text-theatre-text-secondary">info@lillaimproteatern.se</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-accent">
              Öppettider
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-theatre-accent mt-1" />
                <div className="text-theatre-text-secondary">
                  <div>Mån-Fre: 18:00-22:00</div>
                  <div>Lör-Sön: 14:00-20:00</div>
                  <div className="text-sm mt-1 text-theatre-text-muted">
                    (Eller enligt föreställningsschema)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-accent">
              Snabblänkar
            </h4>
            <div className="space-y-2">
              <a href="#kurser" className="block text-theatre-text-secondary hover:text-theatre-accent transition-colors">
                Kurser
              </a>
              <a href="#forestallningar" className="block text-theatre-text-secondary hover:text-theatre-accent transition-colors">
                Föreställningar
              </a>
              <a href="#foretag" className="block text-theatre-text-secondary hover:text-theatre-accent transition-colors">
                Företagsworkshops
              </a>
              <a href="#kontakt" className="block text-theatre-text-secondary hover:text-theatre-accent transition-colors">
                Kontakt
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-theatre-gray-medium/30 mt-12 pt-8 text-center">
          <p className="text-theatre-text-muted">
            © 2024 Lilla Improteatern. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
