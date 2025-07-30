// src/components/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',           label: 'Hem' },
  { to: '/kurser',     label: 'Kurser' },
  { to: '/shows',      label: 'Föreställningar' },
  { to: '/anlita-oss', label: 'Boka oss' },
  { to: '/lokal',      label: 'Lokal' },
  { to: '/om-oss',     label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      {/* Stängd header (85px hög) */}
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Vänster sida - Logo på desktop */}
        <Link
          to="/"
          className="hidden md:block group relative w-12 h-12"
        >
          <img 
            src="/Favicon1.svg" 
            alt="LIT Logo" 
            className="w-10 h-10 absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-0"
          />
          <img 
            src="/Favicon2.svg" 
            alt="LIT Logo Hover" 
            className="w-12 h-12 absolute top-[-4px] left-[-5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </Link>

        {/* Mitt - LILLA IMPROTEATERN text (centerad på desktop, vänsterjusterad på mobil) */}
        <Link
          to="/"
          className="font-tanker text-[28px] text-primary-foreground md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
        >
          LILLA IMPROTEATERN
        </Link>

        {/* Höger sida - Hamburger-meny (alltid längst till höger) */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className="w-10 h-10 relative flex flex-col items-center justify-center p-0 ml-auto"
        >
          {open ? (
            // CSS-baserat kryss (24px högt, 4px brett)
            <>
              <span className="absolute w-[4px] h-[24px] bg-primary-foreground rotate-45" />
              <span className="absolute w-[4px] h-[24px] bg-primary-foreground -rotate-45" />
            </>
          ) : (
            // Tre streck, full knappbredd (40px), 4px höjd, 11px mellanrum
            <>
              <span className="block w-full h-[4px] bg-primary-foreground mb-[6px]" />
              <span className="block w-full h-[4px] bg-primary-foreground mb-[6px]" />
              <span className="block w-full h-[4px] bg-primary-foreground" />
            </>
          )}
        </button>
      </div>

      {/* Öppen meny (börjar direkt under headern) */}
      {open && (
        <div className="fixed inset-x-0 top-[85px] z-40 bg-primary-red text-primary-foreground">
          <nav className="flex flex-col items-end pr-6 lg:pr-16 space-y-2 pb-6 pt-4">
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
                      : 'text-primary-foreground hover:text-primary-red'
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
