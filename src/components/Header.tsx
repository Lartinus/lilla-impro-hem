import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { ArrowDown } from 'lucide-react';

const navItems = [
  { to: '/',           label: 'Hem' },
  { to: '/kurser',     label: 'Kurser' },
  { to: '/forestallningar', label: 'Föreställningar' },
  { to: '/boka-oss',   label: 'Boka oss' },
  { to: '/lokal',      label: 'Lokal' },
  { to: '/om-oss',     label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Hover-animera logo med CSS-klasser */}
        <Link
          to="/"
          className="hidden md:block relative w-16 h-16 group"
        >
          {/* Original logo */}
          <OptimizedImage
            src="/logo/Logo1_new.svg"
            alt="LIT Logo"
            className="absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-300 group-hover:opacity-0"
            priority
          />
          {/* Hover-logo */}
          <OptimizedImage
            src="/logo/Logo2_new.svg"
            alt="LIT Logo Hover"
            className="absolute inset-0 w-full h-full object-contain object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            priority
          />
        </Link>

        {/* Site title centrerad på desktop, vänster på mobil */}
        <Link
          to="/"
          className="font-tanker text-[28px] text-primary-foreground md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
        >
          LILLA IMPROTEATERN
        </Link>

        {/* Hamburger-meny */}
        <button
          onClick={() => setOpen(prev => !prev)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className={`w-10 h-10 relative flex flex-col items-center justify-center p-0 ml-auto hamburger-menu ${open ? 'is-open' : ''}`}
        >
          <span className="hamburger-line top"></span>
          <span className="hamburger-line middle"></span>
          <span className="hamburger-line bottom"></span>
        </button>
      </div>

      {/* Öppen meny */}
      {open && (
        <div className="fixed inset-x-0 top-[85px] z-40 bg-primary-red text-primary-foreground main-nav is-open">
          <nav className="flex flex-col items-end pr-6 lg:pr-8 space-y-2 pb-6 pt-4">
            {navItems.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`font-tanker uppercase text-2xl lg:text-3xl transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-primary-foreground hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
