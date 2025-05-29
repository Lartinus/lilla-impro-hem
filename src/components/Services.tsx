
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Theater, Building, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: <GraduationCap className="h-12 w-12 text-theatre-burgundy mb-4" />,
      title: "Kurser i Improv Comedy",
      description: "Från nybörjare till ensemble",
      content: "Vi erbjuder kurser för alla nivåer där du utvecklas i trygga och inspirerande miljöer. Lär dig grunderna i improvisationsteater eller fördjupa dina färdigheter tillsammans med andra som delar din passion.",
      cta: "Se kursutbud",
      link: "/kurser"
    },
    {
      icon: <Theater className="h-12 w-12 text-theatre-burgundy mb-4" />,
      title: "Föreställningar",
      description: "Hög variation med fokus på komik",
      content: "Upplev roliga, smarta och lekfulla föreställningar som visar upp improvisationskonstens bredd. Från klassisk improv till experimentella format – alltid med komiken i centrum.",
      cta: "Boka biljetter",
      link: "#forestallningar"
    },
    {
      icon: <Building className="h-12 w-12 text-theatre-burgundy mb-4" />,
      title: "Företag & Organisationer",
      description: "Workshops och events",
      content: "Skräddarsydda workshops för företag, myndigheter och organisationer. Utveckla teamwork, kreativitet och kommunikation genom improvisationstekniker i en rolig och lärorik miljö.",
      cta: "Kontakta oss",
      link: "#kontakt"
    }
  ];

  return (
    <section className="py-20 bg-white font-gopher">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-theatre-charcoal mb-4">
            Här hittar du
          </h2>
          <p className="text-xl text-theatre-charcoal/70 max-w-3xl mx-auto">
            Allt du behöver för att lära dig, utöva och uppleva Improv Comedy på en och samma plats
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center">
                  {service.icon}
                </div>
                <CardTitle className="text-2xl text-theatre-charcoal group-hover:text-theatre-burgundy transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-theatre-burgundy font-medium text-lg">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-theatre-charcoal/80 leading-relaxed">
                  {service.content}
                </p>
                {service.link.startsWith('/') ? (
                  <Link to={service.link}>
                    <Button 
                      variant="outline" 
                      className="group/btn border-theatre-burgundy text-theatre-burgundy hover:bg-theatre-burgundy hover:text-white w-full"
                    >
                      {service.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    className="group/btn border-theatre-burgundy text-theatre-burgundy hover:bg-theatre-burgundy hover:text-white w-full"
                  >
                    {service.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
