// src/components/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const navItems = [
  { to: '/',           label: 'Hem' },
  { to: '/kurser',     label: 'Kurser' },
  { to: '/forestallningar',      label: 'Föreställningar' },
  { to: '/boka-oss', label: 'Boka oss' },
  { to: '/lokal',      label: 'Lokal' },
  { to: '/om-oss',     label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      {/* Stängd header (85px hög) */}
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Vänster sida - Logo på desktop */}
        <Link
          to="/"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`hidden md:block group relative w-12 h-12 overflow-visible ${
            isHovering ? 'animate-spin-360' : 'animate-spin-reverse'
          }`}
        >
          <OptimizedImage 
            src="/Logo1.svg" 
            alt="LIT Logo" 
            className="w-10 h-10 absolute top-[5px] left-0 transition-opacity duration-300 group-hover:opacity-0"
            priority={true}
            sizes="32px"
          />
          <OptimizedImage 
            src="/Logo2.svg" 
            alt="LIT Logo Hover" 
            className="w-10 h-10 absolute -top-[10px] left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            priority={true}
            sizes="32px"
          />
        </Link>

        {/* Mitt - LILLA IMPROTEATERN text (centerad på desktop, vänsterjusterad på mobil) */}
        <Link
          to="/"
          className="font-tanker text-[28px] text-primary-foreground md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
        >
          LILLA IMPROTEATERN
        </Link>

        {/* Höger sida - Animerad Hamburger-meny */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className={`w-10 h-10 relative flex flex-col items-center justify-center p-0 ml-auto hamburger-menu ${open ? 'is-open' : ''}`}
        >
          <span className="hamburger-line top"></span>
          <span className="hamburger-line middle"></span>
          <span className="hamburger-line bottom"></span>
        </button>
      </div>

      {/* Öppen meny (börjar direkt under headern) */}
      {open && (
        <div className={`fixed inset-x-0 top-[85px] z-40 bg-primary-red text-primary-foreground main-nav ${open ? 'is-open' : ''}`}>
          <nav className="flex flex-col items-end pr-6 lg:pr-8 space-y-2 pb-6 pt-4">
            {navItems.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`
                    font-tanker uppercase text-2xl lg:text-3xl transition-colors
                    ${isActive
                      ? 'text-primary-foreground'
                      : 'text-primary-foreground hover:text-white'
                    }
                  `}
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
