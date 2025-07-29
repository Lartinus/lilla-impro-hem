// src/components/Header.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
        {/* Logotyp */}
        <Link to="/" className="logo-symbol font-tanker text-2xl lg:text-3xl">
          O|O
        </Link>

        {/* Titel på desktop */}
        <span className="font-tanker text-[28px] lg:text-[28px]">
          LILLA IMPROTEATERN
        </span>

        {/* Hamburger / Stäng-ikon */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded"
        >
          {open
            ? <X size={28} strokeWidth={2} />
            : <Menu size={28} strokeWidth={2} />
          }
        </button>
      </div>

      {/* Öppen meny – börjar direkt under headern (85px offset) */}
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
