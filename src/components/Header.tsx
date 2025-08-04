import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Hem' },
  { to: '/kurser', label: 'Kurser' },
  { to: '/forestallningar', label: 'Föreställningar' },
  { to: '/boka-oss', label: 'Boka oss' },
  { to: '/lokal', label: 'Lokal' },
  { to: '/om-oss', label: 'Om oss & kontakt' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { pathname } = useLocation();

  // SVG-paths
  const leftRightPath = "M109.26,164.16c0,47.84-13.59,65.1-54.63,65.1S0,211.99,0,164.16v-87.75C0,28.86,13.59,11.31,54.63,11.31s54.63,17.55,54.63,65.1v87.75h0ZM231.48,173.79c0,11.32,4.53,15.85,14.44,15.85s14.44-4.53,14.44-15.85v-105.58c0-12.45-4.53-17.27-14.44-17.27s-14.44,4.81-14.44,17.27v105.58h0Z";
  const centerPathNormal = "M169.88,10.47v219.65c0,8.21-2.26,10.47-10.47,10.47h-18.12c-8.21,0-10.47-2.26-10.47-10.47V10.47c0-8.21,2.26-10.47,10.47-10.47h18.12c8.21,0,10.47,2.26,10.47,10.47Z";
  const centerPathHover = "M0,220h140v5H0z";

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Logo med hover och spin */}
        <Link
          to="/"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`hidden md:block relative w-16 h-16 group ${isHovering ? 'animate-spin-360' : 'animate-spin-reverse'}`}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 300 240"
            preserveAspectRatio="xMinYMin meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Vänster öga */}
            <path d={leftRightPath} fill="#fff" />
            {/* Höger öga */}
            <path d={leftRightPath} fill="#fff" transform="translate(150,0)" />
            {/* Mittpelare eller streck */}
            <path d={isHovering ? centerPathHover : centerPathNormal} fill="#fff" />
          </svg>
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
          className={`w-10 h-10 relative flex flex-col justify-center items-center ml-auto hamburger-menu ${open ? 'is-open' : ''}`}
        >
          <span className="hamburger-line top" />
          <span className="hamburger-line middle" />
          <span className="hamburger-line bottom" />
        </button>
      </div>

      {/* Mobilmeny */}
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