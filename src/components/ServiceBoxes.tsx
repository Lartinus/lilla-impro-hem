
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// Vi hoppar över useHeroImages och Strapi
// import { useHeroImages } from '@/hooks/useHeroImages';
// import { getStrapiImageUrl } from '@/utils/strapiHelpers';
import OptimizedImage from './OptimizedImage';

const ServiceBoxes = () => {
  // All data och bilder är hårdkodad
  const services = [
    {
      title: "Kurser i Improv Comedy - från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser",
      image: "/lovable-uploads/92056082-2a67-45f4-888c-9f6831a95637.png"
    },
    {
      title: "Föreställningar med hög variation och fokus på humor.",
      cta: "Se kommande föreställningar",
      link: "/shows",
      image: "/lovable-uploads/a058285b-42ba-4479-bf93-e1f02146b2ff.png"
    },
    {
      title: "Workshops och events för företag, myndigheter och organisationer.",
      cta: "Läs mer",
      link: "/foretag",
      image: "/lovable-uploads/fe40da63-55b3-4531-8b00-721bb4cb1ed0.png"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="border border-gray-200 rounded-none overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[300px]">
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
            <div className="bg-red-700 p-4 md:p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-full h-px bg-white/30"></div>
                <p className="text-white leading-relaxed font-light text-base">
                  {service.title}
                </p>
              </div>
              <div className="pt-6">
                {service.link.startsWith('/') ? (
                  <Link to={service.link} className="inline-block w-full">
                    <Button variant="default" className="bg-red-700 text-white hover:bg-red-800 px-4 py-3 font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all w-full text-left justify-start h-auto whitespace-normal">
                      {service.cta} →
                    </Button>
                  </Link>
                ) : (
                  <Button variant="default" className="bg-red-700 text-white hover:bg-red-800 px-4 py-3 font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all w-full text-left justify-start h-auto whitespace-normal">
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

