import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-theatre-tertiary backdrop-blur-md border-b border-theatre-light/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center min-w-0">
              <img 
                src="/lovable-uploads/LIT_WoB_small.png" 
                alt="Lilla Improteatern" 
                className="h-10 w-auto max-w-none flex-shrink-0"
              />
            </Link>
          </div>
          
          {/* Desktop navigation menu – hide on smaller screens, hide earlier if not enough space */}
          <nav className="hidden xl:flex items-center space-x-12">
            <Link 
              to="/" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Hem
            </Link>
            <Link 
              to="/kurser" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/kurser') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Kurser
            </Link>
            <Link 
              to="/foretag" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/foretag') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Företag
            </Link>
            <Link 
              to="/mohippa" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/mohippa') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Möhippa
            </Link>
            <Link 
              to="/om-oss" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/om-oss') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Om oss
            </Link>
            <Link 
              to="/shows" 
              className={`text-theatre-light/80 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/shows') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px' }}
            >
              Föreställningar
            </Link>
          </nav>

          {/* Hamburger menyn: syns alltid utom på xl (dvs visas från mobil till och med lg) */}
          <Button
            variant="ghost"
            size="sm"
            className="flex xl:hidden text-theatre-light hover:bg-theatre-light/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobilmeny & ihop-fälld meny för mindre skärmar */}
        {isMenuOpen && (
          <div className="xl:hidden pb-6 animate-fade-in">
            <nav className="flex flex-col space-y-6">
              <Link to="/" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Hem
              </Link>
              <Link to="/kurser" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Kurser
              </Link>
              <Link to="/foretag" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Företag
              </Link>
              <Link to="/mohippa" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Möhippa
              </Link>
              <Link to="/om-oss" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Om oss
              </Link>
              <Link to="/shows" className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" style={{ fontSize: '16px' }}>
                Föreställningar
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
