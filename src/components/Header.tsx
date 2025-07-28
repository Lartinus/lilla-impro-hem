
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
<header className="fixed top-0 left-0 right-0 z-50 bg-theatre-tertiary text-theatre-light backdrop-blur-md font-satoshi">
  <div className="container mx-auto px-2 lg:px-8 overflow-visible">
    <div className="flex items-center justify-between h-20 lg:h-28">
      {/* Logo */}
      <div className="flex items-center -ml-6 lg:-ml-8 overflow-visible">
        <Link to="/" className="flex items-center">
          <img
            src="/uploads/LIT_white_tiny.png"
            alt="Lilla Improteatern"
            className="h-[140px] lg:h-[160px] w-auto flex-shrink-0"
          />
        </Link>
          </div>

          {/* Desktopnav*/}
          <nav
  className="hidden lg:flex relative top-1 lg:top-2 text-theatre-light font-satoshi [&_a]:!text-sm space-x-12">
            <NavLink to="/">Hem</NavLink>
            <NavLink to="/kurser">Kurser</NavLink>
            <NavLink to="/shows">Föreställningar</NavLink>
            <NavLink to="/anlita-oss">Anlita oss</NavLink>
            <NavLink to="/lokal">Lokal</NavLink>
            <NavLink to="/om-oss">Om oss & kontakt</NavLink>
          </nav>

          {/* Mobilmeny‐knapp */}
          <Button
            variant="ghost"
            className="flex lg:hidden text-theatre-light hover:bg-theatre-light/20 p-4 mt-2 [&_svg]:!size-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {isMenuOpen ? <X size={32} strokeWidth={2} className="text-theatre-light w-12 h-12" /> : <Menu size={32} strokeWidth={2} className="text-theatre-light w-12 h-12" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-md z-40 animate-fade-in">
            <div className="flex flex-col h-full pt-12 px-8">
              <nav className="flex flex-col space-y-8">
                <Link 
                  to="/" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  HEM
                </Link>
                <Link 
                  to="/kurser" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/kurser' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  KURSER
                </Link>
                <Link 
                  to="/shows" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/shows' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  FÖRESTÄLLNINGAR
                </Link>
                <Link 
                  to="/anlita-oss" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/anlita-oss' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ANLITA OSS
                </Link>
                <Link 
                  to="/lokal" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/lokal' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOKAL
                </Link>
                <Link 
                  to="/om-oss" 
                  className={`text-2xl font-light transition-colors py-2 ${
                    location.pathname === '/om-oss' ? 'text-theatre-accent' : 'text-white hover:text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  OM OSS & KONTAKT
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
