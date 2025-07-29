// src/components/Header.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',         label: 'Hem' },
  { to: '/kurser',   label: 'Kurser' },
  { to: '/shows',    label: 'Föreställningar' },
  { to: '/anlita-oss', label: 'Boka oss' },
  { to: '/lokal',    label: 'Lokal' },
  { to: '/om-oss',   label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Bas-header */}
      <div className="bg-primary-red flex items-center justify-between px-4 lg:px-8 h-16 lg:h-20">
        {/* Logo */}
        <Link to="/" className="logo-symbol font-tanker text-white text-2xl lg:text-3xl">
          O|O
        </Link>
        {/* Titel på desktop */}
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

      {/* Öppen meny */}
      {open && (
        <div className="fixed inset-x-0 top-0 z-40 bg-primary-red pt-16 lg:pt-20">
          {/* Stäng-knapp */}
          <div className="flex justify-end px-4 lg:px-8 py-4">
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
                  text-white hover:text-primary-red 
                  transition-colors 
                  ${pathname === to ? 'text-primary-red' : 'text-white'} 
                  text-2xl lg:text-3xl
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
