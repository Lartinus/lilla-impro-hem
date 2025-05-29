
import { Button } from '@/components/ui/button';
import { GraduationCap, Theater, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceBoxes = () => {
  const services = [
    {
      icon: <GraduationCap className="h-6 w-6 text-theatre-text-muted" />,
      title: "Kurser i Improv Comedy – från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-6 w-6 text-theatre-text-muted" />,
      title: "Föreställningar i hög variation med fokus på komik",
      cta: "Se kommande föreställningar",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-6 w-6 text-theatre-text-muted" />,
      title: "Workshops och events för företag, myndigheter och organisationer",
      cta: "Läs mer",
      link: "#kontakt"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="bg-theatre-gray-light/50 backdrop-blur-sm border border-theatre-gray-medium/30 rounded-2xl p-8 hover:bg-theatre-gray-light/70 transition-all duration-500 hover:border-theatre-gray-medium/50">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                {service.icon}
                <div className="w-full h-px bg-theatre-gray-medium/50"></div>
              </div>
              
              <p className="text-theatre-text-primary leading-relaxed text-lg font-light">
                {service.title}
              </p>
              
              {service.link.startsWith('/') ? (
                <Link to={service.link}>
                  <Button 
                    variant="ghost"
                    className="text-theatre-accent hover:bg-theatre-gray-medium/30 px-0 font-light text-base underline underline-offset-4 decoration-theatre-accent/50 hover:decoration-theatre-accent transition-all"
                  >
                    {service.cta} →
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="ghost"
                  className="text-theatre-accent hover:bg-theatre-gray-medium/30 px-0 font-light text-base underline underline-offset-4 decoration-theatre-accent/50 hover:decoration-theatre-accent transition-all"
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
