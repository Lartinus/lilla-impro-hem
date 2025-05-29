
import { Button } from '@/components/ui/button';
import { GraduationCap, Theater, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceBoxes = () => {
  const services = [
    {
      icon: <GraduationCap className="h-6 w-6 text-white/70" />,
      title: "Kurser i Improv Comedy – från nybörjare till ensemble.",
      cta: "Utforska våra kurser",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-6 w-6 text-white/70" />,
      title: "Föreställningar i hög variation med fokus på komik",
      cta: "Se kommande föreställningar",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-6 w-6 text-white/70" />,
      title: "Workshops och events för företag, myndigheter och organisationer",
      cta: "Läs mer",
      link: "#kontakt"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {services.map((service, index) => (
        <div key={index} className="group">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:border-white/20">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                {service.icon}
                <div className="w-full h-px bg-white/10"></div>
              </div>
              
              <p className="text-white/90 leading-relaxed text-lg font-light">
                {service.title}
              </p>
              
              {service.link.startsWith('/') ? (
                <Link to={service.link}>
                  <Button 
                    variant="ghost"
                    className="text-white hover:bg-white/10 px-0 font-light text-base underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-all"
                  >
                    {service.cta} →
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="ghost"
                  className="text-white hover:bg-white/10 px-0 font-light text-base underline underline-offset-4 decoration-white/30 hover:decoration-white/60 transition-all"
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
