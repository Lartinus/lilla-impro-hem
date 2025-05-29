
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-left space-y-16">
          {/* Main heading with modern typography */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight text-theatre-text-primary tracking-tight">
              Lilla Improteatern är en plats för dig som vill{' '}
              <span className="font-medium">lära dig</span>,{' '}
              <span className="font-medium">utöva</span> och{' '}
              <span className="font-medium">uppleva</span>{' '}
              Improv Comedy.
            </h1>
          </div>

          {/* Description with better spacing */}
          <div className="max-w-3xl">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-text-secondary font-light">
              Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
            </p>
          </div>

          {/* Services section */}
          <div className="space-y-12">
            <p className="text-xl text-theatre-text-primary font-light">Här hittar du:</p>
            <ServiceBoxes />
          </div>

          {/* Mission statement */}
          <div className="max-w-4xl space-y-8 pt-16">
            <p className="text-xl md:text-2xl leading-relaxed text-theatre-text-secondary font-light">
              Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare – och på att skapa ett community 
              där du som elev, improvisatör och publik blir en del av något större.
            </p>
            <p className="text-2xl md:text-3xl font-light text-theatre-text-primary">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
