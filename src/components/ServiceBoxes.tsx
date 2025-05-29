
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Theater, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceBoxes = () => {
  const services = [
    {
      icon: <GraduationCap className="h-8 w-8 text-white mb-4" />,
      title: "Kurser i Improv Comedy – från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-8 w-8 text-white mb-4" />,
      title: "Föreställningar i hög variation med fokus på komik",
      cta: "Se kommande föreställningar",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-8 w-8 text-white mb-4" />,
      title: "Workshops och events för företag, myndigheter och organisationer",
      cta: "Läs mer",
      link: "#kontakt"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {services.map((service, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              {service.icon}
            </div>
            <p className="text-white/90 leading-relaxed text-sm">
              {service.title}
            </p>
            {service.link.startsWith('/') ? (
              <Link to={service.link}>
                <Button 
                  size="sm" 
                  className="bg-white text-theatre-burgundy hover:bg-white/90 px-4 py-2 text-xs font-medium w-full"
                >
                  {service.cta}
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                className="bg-white text-theatre-burgundy hover:bg-white/90 px-4 py-2 text-xs font-medium w-full"
              >
                {service.cta}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceBoxes;
