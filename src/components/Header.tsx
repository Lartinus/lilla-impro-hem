import { useState } from 'react';
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary-red text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between h-[85px]">
        {/* Hover-animera inline SVG-logotyper */}
        <Link
          to="/"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`hidden md:block relative w-16 h-16 group ${isHovering ? 'animate-spin-360' : 'animate-spin-reverse'}`}
        >
          {/* Original logo som inline SVG */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-300 group-hover:opacity-0"
            viewBox="0 0 302.02 310.78"
            preserveAspectRatio="xMinYMin meet"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMin meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>{`.cls-1{fill:#fff}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M109.26,164.16c0,47.84-13.59,65.1-54.63,65.1S0,211.99,0,164.16v-87.75C0,28.86,13.59,11.31,54.63,11.31s54.63,17.55,54.63,65.1v87.75h0ZM40.2,173.79c0,11.32,4.53,15.85,14.44,15.85s14.44-4.53,14.44-15.85v-105.58c0-12.45-4.53-17.27-14.44-17.27s-14.44,4.81-14.44,17.27v105.58ZM169.88,10.47v219.65c0,8.21-2.26,10.47-10.47,10.47h-18.12c-8.21,0-10.47-2.26-10.47-10.47V10.47c0-8.21,2.26-10.47,10.47-10.47h18.12c8.21,0,10.47,2.26,10.47,10.47ZM300.54,164.16c0,47.84-13.59,65.1-54.63,65.1s-54.63-17.27-54.63-65.1v-87.75c0-47.55,13.59-65.1,54.63-65.1s54.63,17.55,54.63,65.1v87.75h0ZM231.48,173.79c0,11.32,4.53,15.85,14.44,15.85s14.44-4.53,14.44-15.85v-105.58c0-12.45-4.53-17.27-14.44-17.27s-14.44,4.81-14.44,17.27v105.58h0Z"
            />
          </svg>
          {/* Hover-logo som inline SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            viewBox="0 0 300.54 240.59"
            preserveAspectRatio="xMinYMin meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>{`.cls-1{fill:#fff}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M132.6,187.6c0,48.3-13.7,65.8-55.2,65.8s-55.2-17.4-55.2-65.8v-88.6c0-48,13.7-65.8,55.2-65.8s55.2,17.7,55.2,65.8v88.6h0ZM62.8,197.3c0,11.4,4.6,16,14.6,16s14.6-4.6,14.6-16v-106.7c0-12.6-4.6-17.4-14.6-17.4s-14.6,4.9-14.6,17.4v106.7h0Z M324.2,187.6c0,48.3-13.7,65.8-55.2,65.8s-55.2-17.4-55.2-65.8v-88.6c0-48,13.7-65.8,55.2-65.8s55.2,17.7,55.2,65.8v88.6h0ZM254.5,197.3c0,11.4,4.6,16,14.6,16s14.6-4.6,14.6-16v-106.7c0-12.6-4.6-17.4-14.6-17.4s-14.6,4.9-14.6,17.4v106.7h0Z M281.4,331.8c-18.8,10.6-33.1,12.1-74.1,12.1h-71.7c-41,0-55.3-1.5-74.1-12.1l-10.9-6.1c-6.4-3.6-8.2-6.7-8.2-14.9v-22.8c0-4,1.5-5.5,4.6-5.5s4.2,1.2,7.3,2.4l6.1,2.7c26.1,11.9,31.9,14.3,75.3,14.3h71.7c43.4,0,49.2-2.4,75.3-14.3l6.1-2.7c3-1.2,5.5-2.4,7.3-2.4,3,0,4.6,1.5,4.6,5.5v22.8c0,8.2-1.8,11.2-8.2,14.9l-10.9,6.1h0Z"
            />
          </svg>
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
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-primary-foreground hover:text-white'
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
