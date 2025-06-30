
// src/components/NavLink.tsx
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  disableUnderline?: boolean;
}

export default function NavLink({
  to,
  children,
  disableUnderline = false,
}: NavLinkProps) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "font-satoshi text-base-mobile font-light transition-colors duration-300",
        "text-theatre-light/90 hover:text-theatre-light",
        {
          // Lägg bara på understrykningen om länken är aktiv **och** disableUnderline = false
          "text-theatre-light lg:relative lg:after:absolute lg:after:bottom-[-8px] lg:after:left-0 lg:after:w-full lg:after:h-0.5 lg:after:bg-theatre-light":
            isActive && !disableUnderline,
        }
      )}
    >
      {children}
    </Link>
  );
}
