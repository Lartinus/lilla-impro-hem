
// src/components/Header.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavLink from '@/components/NavLink';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-theatre-tertiary text-theatre-light backdrop-blur-md font-satoshi">
      <div className="container mx-auto px-1 lg:px-5">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center overflow-visible -ml-4 lg:ml-0">
            <Link to="/" className="flex items-center">
              <img
                src="/uploads/LIT_white_tiny.png"
                alt="Lilla Improteatern"
                className="h-[100px] lg:h-[120px] w-auto flex-shrink-0"
              />
            </Link>
          </div>

          {/* Desktopnav*/}
          <nav className="hidden lg:flex items-center text-theatre-light space-x-12 font-satoshi">
            <NavLink to="/">Hem</NavLink>
            <NavLink to="/kurser">Kurser</NavLink>
            <NavLink to="/foretag">Företag</NavLink>
            <NavLink to="/mohippa">Möhippa</NavLink>
            <NavLink to="/anlita-oss">Anlita oss</NavLink>
            <NavLink to="/om-oss">Om oss</NavLink>
            <NavLink to="/shows">Föreställningar</NavLink>
          </nav>

          {/* Mobilmeny‐knapp */}
          <Button
            variant="ghost"
            size="sm"
            className="flex lg:hidden text-theatre-light hover:bg-theatre-light/20 font-satoshi [&>svg]:text-theatre-light"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 px-4 animate-fade-in">
            <nav className="flex flex-col space-y-6 text-theatre-light font-satoshi">
              <NavLink to="/"    disableUnderline>Hem</NavLink>
              <NavLink to="/kurser" disableUnderline>Kurser</NavLink>
              <NavLink to="/foretag" disableUnderline>Företag</NavLink>
              <NavLink to="/mohippa" disableUnderline>Möhippa</NavLink>
              <NavLink to="/anlita-oss" disableUnderline>Anlita oss</NavLink>
              <NavLink to="/om-oss"  disableUnderline>Om oss</NavLink>
              <NavLink to="/shows"  disableUnderline>Föreställningar</NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
