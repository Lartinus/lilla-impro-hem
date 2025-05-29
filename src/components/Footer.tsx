
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theatre-tertiary text-theatre-light py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/ac906279-978d-4e9c-b9a1-eb3a90b48aef.png" 
              alt="Lilla Improteatern" 
              className="h-16 w-auto"
            />
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
                <span className="text-theatre-light/80">Stockholm</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-theatre-light/70" />
                <span className="text-theatre-light/80">+46 70 245 04 74</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-theatre-light/70" />
                <span className="text-theatre-light/80">info@lillaimproteatern.se</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theatre-light">
              Snabblänkar
            </h4>
            <div className="space-y-2">
              <a href="/kurser" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Kurser
              </a>
              <a href="/foretag" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Företag
              </a>
              <a href="/om-oss" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Om oss
              </a>
              <a href="#forestallningar" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Föreställningar
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
