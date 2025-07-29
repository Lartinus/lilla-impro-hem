// src/components/Header.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavLink from '@/components/NavLink';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
<header className="fixed top-0 left-0 right-0 z-[40] bg-background-gray backdrop-blur-md font-satoshi">
  <div className="container mx-auto px-2 lg:px-8 overflow-visible">
    <div className="flex items-center justify-between h-20 lg:h-28">
      {/* Logo */}
      <div className="flex items-center -ml-6 lg:-ml-8 overflow-visible relative z-[110]">
        <Link to="/" className="flex items-center">
          <span className="logo-symbol text-2xl">O|O</span>
        </Link>
          </div>

          {/* Dold desktop nav - använder bara hamburgermeny nu */}
          <nav className="hidden">
            <NavLink to="/">Hem</NavLink>
            <NavLink to="/kurser">Kurser</NavLink>
            <NavLink to="/shows">Föreställningar</NavLink>
            <NavLink to="/anlita-oss">Anlita oss</NavLink>
            <NavLink to="/lokal">Lokal</NavLink>
            <NavLink to="/om-oss">Om oss & kontakt</NavLink>
          </nav>

          {/* Hamburger meny-knapp för alla skärmstorlekar */}
          <Button
            variant="ghost"
            className="text-text-gray hover:bg-text-gray/20 p-4 pr-8 mt-2 [&_svg]:!size-auto relative z-[110]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {isMenuOpen ? 
              <X size={32} strokeWidth={2} className="text-text-gray w-12 h-12" /> : 
              <Menu size={32} strokeWidth={2} className="text-text-gray w-12 h-12" />
            }
          </Button>
        </div>

        {isMenuOpen && (
          <div className="fixed top-0 right-0 w-full lg:w-80 h-screen bg-footer-black z-[100] animate-slide-in-right">
            
            <div className="flex flex-col h-full pt-24 lg:pt-32 pr-8 lg:pr-16 text-right">
              <nav className="flex flex-col items-end space-y-2">
                <Link 
                  to="/" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hem
                </Link>
                <Link 
                  to="/shows" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/shows' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Föreställningar
                </Link>
                <Link 
                  to="/courses" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/courses' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kurser
                </Link>
                <Link 
                  to="/mohippa" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/mohippa' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Möhippa
                </Link>
                <Link 
                  to="/corporate" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/corporate' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Företag
                </Link>
                <Link 
                  to="/about" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/about' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Om oss
                </Link>
                <Link 
                  to="/lokal" 
                  className={`text-2xl lg:text-3xl transition-colors hover:text-primary-red font-satoshi ${
                    location.pathname === '/lokal' ? 'text-primary-red' : 'text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lokal
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;