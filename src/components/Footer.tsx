
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-theatre-tertiary text-theatre-light py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/ac906279-978d-4e9c-b9a1-eb3a90b48aef.png" 
              alt="Lilla Improteatern" 
              className="h-16 w-auto hidden md:block"
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
              <Link to="/kurser" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Kurser
              </Link>
              <Link to="/foretag" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Företag
              </Link>
              <Link to="/mohippa" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Möhippa
              </Link>
              <Link to="/om-oss" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Om oss
              </Link>
              <Link to="/shows" className="block text-theatre-light/80 hover:text-theatre-light transition-colors">
                Föreställningar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
