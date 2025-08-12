import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Hem' },
  { to: '/kurser', label: 'Kurser' },
  { to: '/forestallningar', label: 'Föreställningar' },
  { to: '/boka-oss', label: 'Boka oss' },
  { to: '/lokal', label: 'Lokal' },
  { to: '/om-oss', label: 'Om oss & kontakt' },
  { to: '/integritet', label: 'Integritet & cookies' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { pathname } = useLocation();



  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Logo med hover och spin */}
        <Link
          to="/"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`hidden md:block relative w-10 h-10 group ${isHovering ? 'animate-spin-360' : 'animate-spin-reverse'}`}
        >
          <img
            src="/logo/Logo1.svg"
            alt="LIT Logo"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
          />
          <img
            src="/logo/Logo2.svg"
            alt="LIT Logo Hover"
            className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </Link>

        {/* Sidtitel */}
        <Link
          to="/"
          className="font-tanker text-[28px] text-primary-foreground md:absolute md:left-1/2 md:transform md:-translate-x-1/2"
        >
          LILLA IMPROTEATERN
        </Link>

        {/* Hamburgermeny */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          className={`w-9 h-9 relative flex flex-col justify-center items-center ml-auto hamburger-menu ${open ? 'is-open' : ''}`}
        >
          <span className="hamburger-line top" />
          <span className="hamburger-line middle" />
          <span className="hamburger-line bottom" />
        </button>
      </div>

      {/* Mobilmeny */}
      {open && (
        <div className="fixed left-0 right-0 top-[85px] z-40 bg-primary-red text-primary-foreground main-nav is-open">
          <div className="container mx-auto px-6 lg:px-8">
            <nav className="flex flex-col items-end space-y-2 pb-6 pt-4">
            {navItems.map(({ to, label }) => {
              const isActive = pathname === to;
              const isPrivacy = to === '/integritet';
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`${
                    isPrivacy ? 'font-satoshi normal-case text-lg mt-4' : 'font-tanker uppercase text-2xl lg:text-3xl'
                  } transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-primary-foreground hover:text-white'
                  }`}
                >
                  {isPrivacy ? 'Integritet & cookies' : label}
                </Link>
              );
            })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
