// src/components/ServiceBoxes.tsx
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const ServiceBoxes = () => {
  const services = [
    {
      title: "Kurser",
      subtitle: "För dig som vill utvecklas på scen",
      cta: "Utforska våra kurser",
      link: "/kurser",
      image: "/uploads/images/kurser_LIT_2024.jpg"
    },
    {
      title: "Föreställningar",
      subtitle: "Med stor bredd och mycket skratt",
      cta: "Kommande föreställningar",
      link: "/shows",
      image: "/uploads/images/Improvision2024.jpg"
    },
    {
      title: "Underhållning",
      subtitle: "För företag och privata tillställningar",
      cta: "Läs mer",
      link: "/anlita-oss",
      image: "/uploads/images/corporate_LIT_2024.jpg"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {services.map((svc, i) => (
        <div key={i} className="group flex flex-col h-full rounded-[10px] overflow-hidden">
          {/* Bilden = halva höjden */}
          <div className="relative flex-1 h-0">
            <OptimizedImage
              src={svc.image}
              alt={svc.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              preferredSize="medium"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Textinnehåll = andra halvan */}
          <div className="bg-card-background p-4 md:p-8 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="font-tanker text-[40px] leading-snug">
                {svc.title}
              </h2>
              <p className="font-satoshi text-[16px] mt-2">
                {svc.subtitle}
              </p>
            </div>
            <div className="pt-6">
              {svc.link.startsWith('/') ? (
                <Button asChild size="sm" className="md:px-4 md:py-2 lg:px-4 lg:py-2">
                  <Link to={svc.link}>{svc.cta} →</Link>
                </Button>
              ) : (
                <Button size="sm" className="md:px-4 md:py-2 lg:px-4 lg:py-2">
                  {svc.cta} →
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceBoxes;
