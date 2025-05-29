
import { Button } from '@/components/ui/button';
import { GraduationCap, Theater, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceBoxes = () => {
  const services = [
    {
      icon: <GraduationCap className="h-6 w-6 text-theatre-primary" />,
      title: "Kurser i Improv Comedy – från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-6 w-6 text-theatre-primary" />,
      title: "Föreställningar i hög variation med fokus på komik",
      cta: "Se kommande föreställningar",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-6 w-6 text-theatre-primary" />,
      title: "Workshops och events för företag, myndigheter och organisationer",
      cta: "Läs mer",
      link: "#kontakt"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="bg-white border border-gray-200 rounded-none p-10 hover:shadow-lg transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                {service.icon}
                <div className="w-full h-px bg-theatre-primary/30"></div>
              </div>
              
              <p className="text-theatre-primary leading-relaxed text-lg font-light max-w-xs">
                {service.title}
              </p>
              
              {service.link.startsWith('/') ? (
                <Link to={service.link}>
                  <Button 
                    variant="ghost"
                    className="text-theatre-primary hover:bg-theatre-primary/10 px-0 font-light text-base underline underline-offset-4 decoration-theatre-primary/50 hover:decoration-theatre-primary transition-all"
                  >
                    {service.cta} →
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="ghost"
                  className="text-theatre-primary hover:bg-theatre-primary/10 px-0 font-light text-base underline underline-offset-4 decoration-theatre-primary/50 hover:decoration-theatre-primary transition-all"
                >
                  {service.cta} →
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
