// src/components/Footer.tsx
import { Link } from 'react-router-dom';

const footerNavItems = [
  { to: '/', label: 'HEM' },
  { to: '/kurser', label: 'KURSER' },
  { to: '/shows', label: 'FÖRESTÄLLNINGAR' },
  { to: '/boka-oss', label: 'BOKA OSS' },
  { to: '/om-oss', label: 'OM OSS' },
  { to: '/om-oss', label: 'KONTAKT' },
];

export default function Footer() {
  return (
    <footer className="bg-footer-black py-8 md:py-12" style={{ color: 'rgb(var(--white))' }}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-8 md:space-y-0">
          
          {/* #2 Länkdelen - först på mobil, sist på desktop */}
          <nav className="flex flex-col space-y-2 order-1 md:order-2 md:text-right">
            {footerNavItems.map(({ to, label }) => (
              <Link
                key={to + label}
                to={to}
                className="font-satoshi text-sm uppercase tracking-wider hover:opacity-80 transition-colors underline"
                style={{ color: 'rgb(var(--white))' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* #1 Logotyp-delen - andra på mobil, först på desktop */}
          <div className="md:max-w-md order-2 md:order-1">
            <h2 className="font-tanker text-[32px] leading-tight mb-4" style={{ color: 'rgb(var(--white))' }}>
              LILLA IMPROTEATERN
            </h2>
            
            <p className="text-sm mb-6" style={{ color: 'rgb(var(--white))' }}>
              Org. nr: 559537-8786<br />
              kontakt@improteatern.se
            </p>
            
            <p className="font-tanker text-[18px] leading-relaxed" style={{ color: 'rgb(var(--white))' }}>
              Lilla improteatern står på helt egna ben, utan kulturstöd. Genom att delta i våra 
              kurser, se våra föreställningar eller boka oss bidrar du till ett levande kulturliv.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}