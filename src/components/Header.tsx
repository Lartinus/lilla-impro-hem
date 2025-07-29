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
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Logotyp (md+) */}
        <Link
          to="/"
          className="hidden md:block logo-symbol font-tanker text-[32px] text-primary-foreground"
        >
          O|O
        </Link>

        {/* Titel på desktop */}
        <Link
          to="/"
          className="hidden lg:block font-tanker text-xl lg:text-2xl text-primary-foreground"
        >
          LILLA IMPROTEATERN
        </Link>

        {/* Hamburger / Close-knapp */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className="w-10 h-10 flex flex-col items-center justify-center p-0"
        >
          {open ? (
            // Rent CSS-X (ingen Lucide-ikon)
            <>
              <span className="absolute w-[4px] h-8 bg-primary-foreground rotate-45" />
              <span className="absolute w-[4px] h-8 bg-primary-foreground -rotate-45" />
            </>
          ) : (
            // Tre vågräta streck, 11px emellan
            <>
              <span className="w-8 h-[4px] bg-primary-foreground mb-[11px]" />
              <span className="w-8 h-[4px] bg-primary-foreground mb-[11px]" />
              <span className="w-8 h-[4px] bg-primary-foreground" />
            </>
          )}
        </button>
      </div>

      {/* Öppen meny */}
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
                    font-satoshi uppercase text-2xl lg:text-3xl transition-colors
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
