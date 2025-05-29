
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-theatre-tertiary/90 backdrop-blur-md border-b border-theatre-light/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/8c70d3b3-4ad3-4d2d-a831-b759a5ec35eb.png" 
                alt="Lilla Improteatern" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-medium text-theatre-light tracking-wide">
                Lilla Improteatern
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light">
              Hem
            </Link>
            <Link to="/kurser" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light">
              Kurser
            </Link>
            <a href="#forestallningar" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light">
              Föreställningar
            </a>
            <a href="#kontakt" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light">
              Kontakt
            </a>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-theatre-light hover:bg-theatre-light/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-fade-in">
            <nav className="flex flex-col space-y-6">
              <Link to="/" className="text-theatre-light/80 hover:text-theatre-light transition-colors text-base font-light">
                Hem
              </Link>
              <Link to="/kurser" className="text-theatre-light/80 hover:text-theatre-light transition-colors text-base font-light">
                Kurser
              </Link>
              <a href="#forestallningar" className="text-theatre-light/80 hover:text-theatre-light transition-colors text-base font-light">
                Föreställningar
              </a>
              <a href="#kontakt" className="text-theatre-light/80 hover:text-theatre-light transition-colors text-base font-light">
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
