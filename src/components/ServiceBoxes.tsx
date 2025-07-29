// src/components/ServiceBoxes.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';

const services = [
  {
    title: 'Kurser',
    subtitle: 'För dig som vill utvecklas på scen',
    cta: 'Utforska våra kurser',
    link: '/kurser',
    image: '/uploads/images/kurser_LIT_2024.jpg',
  },
  {
    title: 'Föreställningar',
    subtitle: 'Med stor bredd och mycket skratt',
    cta: 'Kommande föreställningar',
    link: '/shows',
    image: '/uploads/images/Improvision2024.jpg',
  },
  {
    title: 'Underhållning',
    subtitle: 'För företag och privata tillställningar',
    cta: 'Läs mer',
    link: '/anlita-oss',
    image: '/uploads/images/corporate_LIT_2024.jpg',
  },
];

export default function ServiceBoxes() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {services.map((svc, idx) => (
        <div key={idx} className="group flex flex-col bg-card-background rounded-[10px] overflow-hidden">
          {/* Bild (50% av höjden) */}
          <div className="relative h-[200px] lg:h-[250px] overflow-hidden">
            <OptimizedImage
              src={svc.image}
              alt={svc.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              preferredSize="medium"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          {/* Innehåll */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="font-tanker text-[40px] text-text-gray leading-tight">{svc.title}</h2>
              <p className="font-satoshi text-[16px] text-text-black leading-relaxed">{svc.subtitle}</p>
            </div>
            <div className="mt-4">
              {svc.link.startsWith('/') ? (
                <Button asChild size="sm">
                  <Link to={svc.link}>{svc.cta} →</Link>
                </Button>
              ) : (
                <Button size="sm">{svc.cta} →</Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
