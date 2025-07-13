
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
  <div className="container mx-auto px-2 lg:px-8 overflow-visible">
    <div className="flex items-center justify-between h-20 lg:h-28">
      {/* Logo */}
      <div className="flex items-center -ml-12 lg:-ml-8 overflow-visible">
        <Link to="/" className="flex items-center">
          <img
            src="/uploads/LIT_white_tiny.png"
            alt="Lilla Improteatern"
            className="h-[120px] lg:h-[160px] w-auto flex-shrink-0"
          />
        </Link>
          </div>

          {/* Desktopnav*/}
          <nav className="hidden lg:flex items-center text-theatre-light font-satoshi font-semibold space-x-12 text-lg">
            <NavLink to="/">HEM</NavLink>
            <NavLink to="/kurser">KURSER</NavLink>
            <NavLink to="/shows">FÖRESTÄLLNINGAR</NavLink>
            <NavLink to="/anlita-oss">ANLITA OSS</NavLink>
            <NavLink to="/lokal">LOKAL</NavLink>
            <NavLink to="/om-oss">OM OSS & KONTAKT</NavLink>
          </nav>

          {/* Mobilmeny‐knapp */}
          <Button
            variant="ghost"
            className="flex lg:hidden text-theatre-light hover:bg-theatre-light/20 font-satoshi [&>svg]:text-theatre-light p-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Stäng meny' : 'Öppna meny'}
          >
            {isMenuOpen ? <X size={36} strokeWidth={3} /> : <Menu size={36} strokeWidth={3} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-8 pt-4 px-6 animate-fade-in">
            <nav className="flex flex-col space-y-8 text-theatre-light font-satoshi font-semibold text-lg">
              <NavLink to="/" disableUnderline>HEM</NavLink>
              <NavLink to="/kurser" disableUnderline>KURSER</NavLink>
              <NavLink to="/shows" disableUnderline>FÖRESTÄLLNINGAR</NavLink>
              <NavLink to="/anlita-oss" disableUnderline>ANLITA OSS</NavLink>
              <NavLink to="/lokal" disableUnderline>LOKAL</NavLink>
              <NavLink to="/om-oss" disableUnderline>OM OSS & KONTAKT</NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
