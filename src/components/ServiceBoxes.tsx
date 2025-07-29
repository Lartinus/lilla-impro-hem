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
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      {services.map((service, idx) => (
        <div key={idx} className="group h-full">
          <div className="overflow-hidden transition-all duration-300 h-full flex flex-col">
            {/* Bilden tar 50% av höjden */}
            <div className="relative flex-1 overflow-hidden">
              <OptimizedImage
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                preferredSize="medium"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            {/* Innehållssektion */}
            <div className="bg-card-background p-4 md:p-8 flex-1 flex flex-col justify-between text-left">
              <div>
                <h2 className="font-tanker text-[40px] leading-tight">
                  {service.title}
                </h2>
                <p className="font-satoshi text-[16px] mt-2">
                  {service.subtitle}
                </p>
              </div>
              <div className="pt-6">
                {service.link.startsWith('/') ? (
                  <Button asChild size="sm" className="md:text-xs md:px-4 md:py-2 lg:text-sm lg:px-4 lg:py-2">
                    <Link to={service.link}>{service.cta} →</Link>
                  </Button>
                ) : (
                  <Button size="sm" className="md:text-xs md:px-4 md:py-2 lg:text-sm lg:px-4 lg:py-2">
                    {service.cta} →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceBoxes;
