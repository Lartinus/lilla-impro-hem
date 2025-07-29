import { ReactNode } from 'react';

interface MainCardProps {
  children: ReactNode;
  className?: string;
}

export default function MainCard({ children, className = '' }: MainCardProps) {
  return (
    <div className={`bg-white rounded-t-[20px] px-6 md:px-8 pt-8 pb-0 ${className}`}>
      {children}
    </div>
  );
}