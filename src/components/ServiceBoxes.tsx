
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

const ServiceBoxes = () => {
  // All data och bilder är hårdkodad
  const services = [
    {
      title: "Kurser i Improv Comedy - från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser",
      image: "/uploads/images/kurser_LIT_2024.jpg"
    },
    {
      title: "Föreställningar med hög variation och fokus på humor.",
      cta: "Se kommande föreställningar",
      link: "/shows",
      image: "/uploads/images/Improvision2024.jpg"
    },
    {
      title: "Workshops och events för företag, myndigheter och organisationer.",
      cta: "Läs mer",
      link: "/foretag",
      image: "/uploads/images/corporate_LIT_2024.jpg"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="border border-color-primary rounded-none overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[300px]">
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
            <div className="bg-red-700 p-4 md:p-8 flex-1 flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div className="w-full h-px bg-white/30"></div>
                <p className="text-theatre-text-primary leading-relaxed font-light text-base">
                  {service.title}
                </p>
              </div>
              <div className="pt-6">
                {service.link.startsWith('/') ? (
                  <Link 
                    to={service.link} 
                    className="text-theatre-text-primary font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all block"
                  >
                    {service.cta} →
                  </Link>
                ) : (
                  <span className="text-theatre-text-primary font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all cursor-pointer">
                    {service.cta} →
                  </span>
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
