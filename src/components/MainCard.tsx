import { ReactNode } from 'react';

interface MainCardProps {
  children: ReactNode;
  className?: string;
}

export default function MainCard({ children, className = '' }: MainCardProps) {
  return (
    <div className={`rounded-t-[12px] md:rounded-t-[12px] px-6 md:px-8 pt-8 pb-0 md:pb-8 ${className}`} style={{ backgroundColor: '#F3F3F3' }}>
      {children}
    </div>
  );
}