
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const ServiceBoxes = () => {
  // All data och bilder är hårdkodad
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
      cta: "Föreställningar",
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
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="border border-color-primary rounded-none overflow-hidden transition-all duration-300 h-full flex flex-col min-h-[300px]">
            {/* Image section - prioritized loading */}
            <div className="relative h-48 overflow-hidden">
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  preferredSize="medium"
                />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            {/* Content section */}
            <div className="bg-[#F3F4F6] p-4 md:p-8 flex-1 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="w-full h-px bg-white/30"></div>
                <div className="space-y-2">
                  <h3 className="text-lg font-satoshi font-medium">
                    {service.title}
                  </h3>
                  <p className="text-base leading-relaxed">
                    {service.subtitle}
                  </p>
                </div>
              </div>
              <div className="pt-6 pb-4">
                {service.link.startsWith('/') ? (
                  <Button asChild>
                    <Link to={service.link}>
                      {service.cta} →
                    </Link>
                  </Button>
                ) : (
                  <Button>
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
