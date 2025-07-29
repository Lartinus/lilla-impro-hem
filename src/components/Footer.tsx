// src/components/Footer.tsx
import { Link } from 'react-router-dom';

const footerNavItems = [
  { to: '/', label: 'HEM' },
  { to: '/kurser', label: 'KURSER' },
  { to: '/shows', label: 'FÖRESTÄLLNINGAR' },
  { to: '/anlita-oss', label: 'BOKA OSS' },
  { to: '/om-oss', label: 'OM OSS' },
  { to: '/om-oss', label: 'KONTAKT' },
];

export default function Footer() {
  return (
    <footer className="bg-footer-black text-white py-8 md:py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-8 md:space-y-0">
          
          {/* #1 Logotyp-delen */}
          <div className="md:max-w-md">
            <h2 className="font-tanker text-[32px] leading-tight mb-4">
              LILLA IMPROTEATERN
            </h2>
            
            <div className="space-y-1 mb-6">
              <p className="text-sm">Org. nr: 559537-8786</p>
              <p className="text-sm">kontakt@improteatern.se</p>
            </div>
            
            <p className="font-tanker text-[18px] leading-relaxed">
              Lilla improteatern står på helt egna ben, utan kulturstöd. Genom att delta i våra 
              kurser, se våra föreställningar eller boka oss bidrar du till ett levande kulturliv.
            </p>
          </div>

          {/* #2 Länkdelen */}
          <nav className="flex flex-col space-y-2 md:text-right">
            {footerNavItems.map(({ to, label }) => (
              <Link
                key={to + label}
                to={to}
                className="font-satoshi text-sm uppercase tracking-wider hover:text-white/80 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}