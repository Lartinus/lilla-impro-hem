// src/components/Header.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',          label: 'Hem' },
  { to: '/kurser',    label: 'Kurser' },
  { to: '/shows',     label: 'Föreställningar' },
  { to: '/anlita-oss',label: 'Boka oss' },
  { to: '/lokal',     label: 'Lokal' },
  { to: '/om-oss',    label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red">
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-20 lg:h-28">
        
        {/* Logotyp */}
        <Link to="/" className="logo-symbol font-tanker text-white text-2xl lg:text-3xl">
          O|O
        </Link>

        {/* Titel (endast desktop enligt skiss) */}
        <span className="hidden lg:block font-tanker text-white text-xl lg:text-2xl">
          LILLA IMPROTEATERN
        </span>

        {/* Hamburger / Stäng */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className="p-2 text-white hover:bg-white/10 rounded"
        >
          {open
            ? <X size={28} strokeWidth={2} />
            : <Menu size={28} strokeWidth={2} />
          }
        </button>
      </div>

      {/* Öppen meny: läggs precis under headerns höjd */}
      {open && (
        <div
          className="fixed inset-x-0 top-20 lg:top-28 z-40 bg-primary-red"
          style={{ paddingTop: 0 }}
        >
          {/* Stäng-knapp */}
          <div className="flex justify-end px-6 lg:px-8 py-4">
            <button
              onClick={() => setOpen(false)}
              aria-label="Stäng meny"
              className="p-2 text-white hover:bg-white/10 rounded"
            >
              <X size={28} strokeWidth={2} />
            </button>
          </div>
          {/* Navigeringslänkar */}
          <nav className="flex flex-col items-end pr-6 lg:pr-16 space-y-2 pb-6">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`
                  font-satoshi uppercase
                  transition-colors
                  text-2xl lg:text-3xl
                  ${pathname === to 
                    ? 'text-primary-red' 
                    : 'text-white hover:text-primary-red'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
