
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-theatre-burgundy text-white relative z-50 font-gopher border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-white">
                Lilla Improteatern
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            <Link to="/" className="text-white/80 hover:text-white transition-colors duration-200 text-lg">
              Hem
            </Link>
            <Link to="/kurser" className="text-white/80 hover:text-white transition-colors duration-200 text-lg">
              Kurser
            </Link>
            <a href="#forestallningar" className="text-white/80 hover:text-white transition-colors duration-200 text-lg">
              Föreställningar
            </a>
            <a href="#kontakt" className="text-white/80 hover:text-white transition-colors duration-200 text-lg">
              Kontakt
            </a>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-fade-in">
            <nav className="flex flex-col space-y-6">
              <Link to="/" className="text-white/80 hover:text-white transition-colors text-lg">
                Hem
              </Link>
              <Link to="/kurser" className="text-white/80 hover:text-white transition-colors text-lg">
                Kurser
              </Link>
              <a href="#forestallningar" className="text-white/80 hover:text-white transition-colors text-lg">
                Föreställningar
              </a>
              <a href="#kontakt" className="text-white/80 hover:text-white transition-colors text-lg">
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
