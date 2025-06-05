
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useHeroImages } from '@/hooks/useHeroImages';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';
import OptimizedImage from './OptimizedImage';

const ServiceBoxes = () => {
  const { data: heroData, isLoading } = useHeroImages();
  
  console.log('ServiceBoxes - Hero data:', heroData);
  
  // Extract images from hero data
  const getImageUrl = (fieldName: string) => {
    if (!heroData?.data) return null;
    const imageField = heroData.data[fieldName];
    return getStrapiImageUrl(imageField, undefined, 'medium');
  };

  const services = [
    {
      title: "Kurser i Improv Comedy - från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser",
      image: getImageUrl('image_course') || "/lovable-uploads/f96ff1ae-f9cb-4df9-8aa9-846ef0297538.png"
    },
    {
      title: "Föreställningar med hög variation och fokus på humor.",
      cta: "Se kommande föreställningar",
      link: "/shows",
      image: getImageUrl('image_shows') || "/lovable-uploads/a018eb4f-8f59-4895-b9b0-565c2b8ad636.png"
    },
    {
      title: "Workshops och events för företag, myndigheter och organisationer.",
      cta: "Läs mer",
      link: "/foretag",
      image: getImageUrl('image_workshop') || "/lovable-uploads/7e10e177-5707-44b1-bbf3-e5f9507d3054.png"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="border border-gray-200 rounded-none overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[300px]">
            {/* Image section - prioritized loading */}
            <div className="relative h-48 overflow-hidden">
              {isLoading ? (
                <div className="w-full h-full bg-gray-300 animate-pulse"></div>
              ) : (
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  preferredSize="medium"
                  loading="eager"
                />
              )}
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
