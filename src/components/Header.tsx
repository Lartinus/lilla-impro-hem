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
            preserveAspectRatio="xMidYMid meet"
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
            viewBox="0 0 302.02 310.78"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <style>{`.cls-1{fill:#fff}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M110.38,154.41c0,48.32-13.72,65.77-55.19,65.77S0,202.74,0,154.41v-88.64C0,17.73,13.72,0,55.19,0s55.19,17.73,55.19,65.77v88.64h0ZM40.61,164.13c0,11.44,4.57,16.01,14.58,16.01s14.58-4.57,14.58-16.01V57.48c0-12.58-4.57-17.44-14.58-17.44s-14.58,4.86-14.58,17.44v106.65Z M302.02,154.41c0,48.32-13.72,65.77-55.19,65.77s-55.19-17.44-55.19-65.77v-88.64C191.64,17.73,205.36,0,246.83,0s55.19,17.73,55.19,65.77v88.64h0ZM232.25,164.13c0,11.44,4.57,16.01,14.58,16.01s14.58-4.57,14.58-16.01V57.48c0-12.58-4.57-17.44-14.58-17.44s-14.58,4.86-14.58,17.44v106.65h0Z M259.15,298.63c-18.84,10.63-33.11,12.15-74.13,12.15h-71.7c-41.01,0-55.29-1.52-74.13-12.15l-10.94-6.08c-6.38-3.65-8.2-6.68-8.2-14.89v-22.79c0-3.95,1.52-5.47,4.56-5.47,1.82,0,4.25,1.22,7.29,2.43l6.08,2.73c26.13,11.85,31.9,14.28,75.34,14.28h71.7c43.44,0,49.22-2.43,75.34-14.28l6.08-2.73c3.04-1.22,5.47-2.43,7.29-2.43,3.04,0,4.56,1.52,4.56,5.47v22.79c0,8.2-1.82,11.24-8.2,14.89l-10.94,6.08h0Z"
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
          className={`w-10 h-10 relative flex flex-col items-center justify  
```
