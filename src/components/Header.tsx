
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-theatre-tertiary backdrop-blur-md border-b border-theatre-light/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/ac906279-978d-4e9c-b9a1-eb3a90b48aef.png" 
                alt="Lilla Improteatern" 
                className="h-16 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light" style={{ fontSize: '16px' }}>
              Hem
            </Link>
            <Link to="/kurser" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light" style={{ fontSize: '16px' }}>
              Kurser
            </Link>
            <a href="#forestallningar" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light" style={{ fontSize: '16px' }}>
              Föreställningar
            </a>
            <a href="#kontakt" className="text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light" style={{ fontSize: '16px' }}>
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
              <Link to="/" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Hem
              </Link>
              <Link to="/kurser" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Kurser
              </Link>
              <a href="#forestallningar" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Föreställningar
              </a>
              <a href="#kontakt" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
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
