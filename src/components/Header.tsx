
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
      <div className="container mx-auto px-1 lg:px-5">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center overflow-visible">
            <Link to="/" className="flex items-center min-w-0">
              <img 
                src="/uploads/LIT_white_tiny.png" 
                alt="Lilla Improteatern" 
                className="h-[100px] lg:h-[120px] w-auto max-w-none flex-shrink-0"
              />
            </Link>
          </div>
          
          {/* Desktop navigation menu – hide on smaller screens */}
          <nav className="hidden lg:flex items-center space-x-12">
            <Link 
              to="/" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Hem
            </Link>
            <Link 
              to="/kurser" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/kurser') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Kurser
            </Link>
            <Link 
              to="/foretag" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/foretag') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Företag
            </Link>
            <Link 
              to="/mohippa" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/mohippa') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Möhippa
            </Link>
            <Link 
              to="/om-oss" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/om-oss') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Om oss
            </Link>
            <Link 
              to="/shows" 
              className={`text-theatre-light/90 hover:text-theatre-light transition-colors duration-300 text-base font-light relative ${
                isActivePage('/shows') ? 'text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light' : ''
              }`} 
              style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
            >
              Föreställningar
            </Link>
          </nav>

          {/* Hamburger menu button - visible on smaller screens */}
          <Button
            variant="ghost"
            size="sm"
            className="flex lg:hidden text-theatre-light hover:bg-theatre-light/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-8 animate-fade-in">
            <nav className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Hem
              </Link>
              <Link 
                to="/kurser" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Kurser
              </Link>
              <Link 
                to="/foretag" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Företag
              </Link>
              <Link 
                to="/mohippa" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Möhippa
              </Link>
              <Link 
                to="/om-oss" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Om oss
              </Link>
              <Link 
                to="/shows" 
                className="text-theatre-light/80 hover:text-theatre-light transition-colors font-light" 
                style={{ fontSize: '16px', fontFamily: 'RetroVoice, sans-serif' }}
                onClick={() => setIsMenuOpen(false)}
              >
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
