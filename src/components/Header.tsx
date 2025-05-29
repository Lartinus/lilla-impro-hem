import { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-theatre-cream shadow-sm relative z-50 font-gopher">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-theatre-burgundy">
                Lilla Improteatern
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors duration-200">
              Hem
            </Link>
            <Link to="/kurser" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors duration-200">
              Kurser
            </Link>
            <a href="#forestallningar" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors duration-200">
              Föreställningar
            </a>
            <a href="#foretag" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors duration-200">
              Företag
            </a>
            <a href="#kontakt" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors duration-200">
              Kontakt
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+46123456789" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
              <Phone size={20} />
            </a>
            <a href="mailto:info@lillaimproteatern.se" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
              <Mail size={20} />
            </a>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-theatre-cream shadow-lg border-t animate-fade-in">
            <nav className="flex flex-col p-4 space-y-4">
              <Link to="/" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
                Hem
              </Link>
              <Link to="/kurser" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
                Kurser
              </Link>
              <a href="#forestallningar" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
                Föreställningar
              </a>
              <a href="#foretag" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
                Företag
              </a>
              <a href="#kontakt" className="text-theatre-charcoal hover:text-theatre-burgundy transition-colors">
                Kontakt
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
