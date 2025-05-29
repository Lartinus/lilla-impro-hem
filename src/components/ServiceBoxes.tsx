
import { Button } from '@/components/ui/button';
import { GraduationCap, Theater, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceBoxes = () => {
  const services = [
    {
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      title: "Kurser i Improv Comedy – från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-6 w-6 text-white" />,
      title: "Föreställningar i hög variation med fokus på komik",
      cta: "Se kommande föreställningar",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-6 w-6 text-white" />,
      title: "Workshops och events för företag, myndigheter och organisationer",
      cta: "Läs mer",
      link: "#kontakt"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-8">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="bg-theatre-primary border border-gray-200 rounded-none p-8 hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[300px]">
            <div className="space-y-6 flex-1">
              <div className="flex items-center space-x-3">
                {service.icon}
                <div className="w-full h-px bg-white/30"></div>
              </div>
              
              <p className="text-white leading-relaxed text-lg font-light flex-1">
                {service.title}
              </p>
              
              <div className="pt-2">
                {service.link.startsWith('/') ? (
                  <Link to={service.link} className="inline-block w-full">
                    <Button 
                      variant="ghost"
                      className="text-white hover:bg-white hover:text-theatre-primary px-4 py-3 font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-theatre-primary transition-all w-full text-left justify-start h-auto whitespace-normal"
                    >
                      {service.cta} →
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost"
                    className="text-white hover:bg-white hover:text-theatre-primary px-4 py-3 font-light text-base underline underline-offset-4 decoration-white/50 hover:decoration-theatre-primary transition-all w-full text-left justify-start h-auto whitespace-normal"
                  >
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
