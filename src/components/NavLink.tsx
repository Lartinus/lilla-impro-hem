// src/components/NavLink.tsx
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

export default function NavLink({ to, children }: NavLinkProps) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "font-retro text-base-mobile font-light transition-colors duration-300",
        "text-theatre-light/90 hover:text-theatre-light",
        {
          "text-theatre-light after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-theatre-light":
            isActive,
        }
      )}
    >
      {children}
    </Link>
  );
}
